import { Command } from "@commander-js/extra-typings"
import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import { existsSync } from "fs"
import { readFile, writeFile } from "fs/promises"
import { basename, extname } from "path"
import { applyCredentials } from "./auth/credentials-file"
import { Endpoint, Module } from "./directory/types-typebox"
import { UnauthorizedError } from "./errors"
import { Download, jutgeApiCall } from "./jutge-api-call"
import {
    isTableData,
    printCsv,
    printJson,
    printObject as printObjectTable,
    printYaml,
} from "./output"

export const TTestcase = Type.Object({
    name: Type.String(),
    input_b64: Type.String(),
    correct_b64: Type.String(),
})
type Testcase = Static<typeof TTestcase>

type OutputFormat = "json" | "table" | "yaml" | "csv" | "raw" | null

const getDescription = (description: string | undefined | null) =>
    description ? description.split(`\n`)[0] : "<undocumented>"

const writeOutputFile = async (filename: string, content: any) => {
    if (existsSync(filename)) {
        const ext = extname(filename)
        const base = filename.slice(0, -ext.length)
        let i = 1
        while (existsSync(`${base} (${i})${ext}`)) {
            i++
        }
        filename = `${base} (${i})${ext}`
    }
    await writeFile(filename, content)
    console.log(`Wrote '${filename}'`)
}

const writeTestcase = async (testcases: Testcase[]) => {
    for (const testcase of testcases) {
        const { name, input_b64, correct_b64 } = testcase
        const base = name.replace(/.inp$/, "")
        await writeOutputFile(`${base}.inp`, Buffer.from(input_b64, "base64"))
        await writeOutputFile(`${base}.cor`, Buffer.from(correct_b64, "base64"))
    }
}

const showArgsAndOptions =
    (funcName: string, endpoint: Endpoint) =>
    async (...args) => {
        const _command = args.pop() as Command
        const options = args.pop()
        console.log(`Calling "${funcName}"`)
        console.log("Args:", JSON.stringify(args, null, 2))
        console.log("Options:", JSON.stringify(options, null, 2))
        console.log("Command: ", _command.name())
    }

const parseArgs = async (args: any[], endpoint: Endpoint) => {
    // args = [params..., options, command]
    args.pop() // Discard command

    let rawOptions: Record<string, any> | null = args.pop()
    // NOTE: Should we check that it is an object?
    if (rawOptions && Object.keys(rawOptions).length === 0) {
        rawOptions = null
    }

    let inputFiles: File[] = []
    let params: any[] = []
    let options: Record<string, any> | null = null

    const { input, ifiles, ofiles } = endpoint

    if (ifiles === "one") {
        // The last argument is the file
        const filename = args[args.length - 1]
        const bytes = await readFile(filename)
        inputFiles.push(new File([bytes], basename(filename)))
    }

    if (ofiles === "one" && rawOptions?.output) {
        options = { output: rawOptions?.output }
    }

    // Output, Account and Format options
    for (const key of Object.keys(rawOptions || {})) {
        switch (key) {
            // All these options do not appear in the API directory, we added
            // them a posteriori, so they don't have an associated schema
            case "json":
            case "table":
            case "yaml":
            case "csv":
            case "raw":
            case "debug":
                if (options === null) {
                    options = {}
                }
                options[key] = Value.Parse(Type.Boolean(), rawOptions![key])
                break
            case "account":
            case "output": {
                if (options === null) {
                    options = {}
                }
                options[key] = Value.Parse(Type.String(), rawOptions![key])
                break
            }
        }
        // Remove these options for the next loop
        delete rawOptions![key]
    }

    if (input.type === "object") {
        // The properties are the options in the command
        if (input.properties) {
            let required = new Set<string>()
            if (input.required) {
                required = new Set(input.required)
            }
            for (const reqprop of required.keys()) {
                if (rawOptions && !(reqprop in rawOptions)) {
                    throw new Error(`Missing required property: ${reqprop}`)
                }
            }
            for (const key of Object.keys(rawOptions || {})) {
                const tschema = input.properties[key]
                if (options === null) {
                    options = {}
                }
                options[key] = Value.Parse(tschema, rawOptions![key])
            }
        } else if (input.patternProperties) {
            throw new Error("Not implemented")
        }
    } else if (input.type === "void") {
        // NOTE(pauek): Is 'void' part of JSON Schema?
        // In the API, the input is a single thing.
        // There can't be more than one parameter
        params = [undefined]
    } else {
        params = [Value.Parse(input, args[0])]
    }

    // -a, --account option for authenticated endpoints
    if (endpoint.actor !== undefined) {
        const account = rawOptions?.account
        if (account !== undefined) {
            options = { ...options, account }
        }
    }

    return { params, options, ifiles: inputFiles }
}

const showResult = async (output: any, format: OutputFormat) => {
    if (Value.Check(Type.Array(TTestcase), output)) {
        // FIXME(pauek): This is a little ugly, we make an exception for TTestcase (test cases for problems)
        await writeTestcase(output)
    } else if (format === "raw") {
        console.log(output)
    } else if (format === "json") {
        printJson(output)
    } else if (format === "yaml") {
        printYaml(output)
    } else if (format === "csv") {
        printCsv(output)
    } else if (format === "table" || (format === null && isTableData(output))) {
        if (typeof output === "object") {
            printObjectTable(output)
        } else if (isTableData(output)) {
            console.log(`warning: data does not seem to fit into a table`)
            console.log(output)
        }
    } else if (typeof output === "object" && !Array.isArray(output)) {
        printObjectTable(output)
    } else {
        console.log(output)
    }
}

const writeOutputFiles = async (ofiles: Download[], outputFile: string | null) => {
    if (ofiles.length === 1) {
        const { name, content } = ofiles[0]
        const filename = outputFile || name
        await writeOutputFile(filename, content)
    } else if (ofiles.length > 1) {
        for (const { name, content } of ofiles) {
            await writeOutputFile(name, content)
        }
    }
}

const processSpecialOptions = async (
    endpoint: Endpoint,
    parsedOptions: Record<string, any> | null,
) => {
    let options: Record<string, any> | null = parsedOptions === null ? null : { ...parsedOptions }
    let outputFile: string | null = null
    let format: OutputFormat = null
    let debug: boolean = false

    const deleteOption = (key: string) => {
        if (options && options[key]) {
            delete options[key]
            if (Object.keys(options).length === 0) {
                options = null
            }
        }
    }

    // Treat -a, --account specially
    if (endpoint.actor !== undefined) {
        if (options && options.account) {
            // Use the supplied credentials for this command
            await applyCredentials(options.account)
            deleteOption("account")
        } else {
            await applyCredentials()
        }
    }

    // Also treat -o, --output specially
    if (endpoint.ofiles === "one" && options && options.output) {
        outputFile = options.output
        deleteOption("output")
    }

    // Boolean options
    for (const fmt of ["json", "table", "yaml", "csv", "raw"]) {
        if (options && options[fmt]) {
            format = fmt as OutputFormat
            deleteOption(fmt)
        }
    }
    if (options && options.debug) {
        debug = true
        deleteOption("debug")
    }

    return { options, outputFile, format, debug }
}

const callApi =
    (funcName: string, endpoint: Endpoint) =>
    async (...args) => {
        const parsed = await parseArgs(args, endpoint)
        const { options, outputFile, format, debug } = await processSpecialOptions(
            endpoint,
            parsed.options,
        )

        try {
            let input: any = options === null ? parsed.params[0] : options

            const [output, ofiles] = await jutgeApiCall(funcName, input, parsed.ifiles, debug)

            await showResult(output, format)
            await writeOutputFiles(ofiles, outputFile)
        } catch (e) {
            if (e instanceof UnauthorizedError) {
                console.error("Unauthorized")
            } else {
                console.error("error:", e.message)
            }
        }
    }

const addArgument = (cmd: Command, input: any) => {
    cmd.argument(`<${input.param}>`, getDescription(input.description))
}

const addInputFile = (cmd: Command) => {
    cmd.argument("<file>", "Input file")
}

const addEndpointOptions = (endpointCmd: Command, endpoint: Endpoint) => {
    const required = new Set(endpoint.input.required || [])
    const properties = Object.entries(endpoint.input.properties) as [string, any][]
    for (const [key, prop] of properties) {
        const isRequired = required.has(key)
        const description = getDescription(prop.description) + (isRequired ? " (required)" : "")
        const dashes = key.length === 1 ? "-" : "--"
        if (isRequired) {
            endpointCmd.requiredOption(`${dashes}${key} <${prop.type}>`, description)
        } else {
            endpointCmd.option(`${dashes}${key} <${prop.type}>`, description)
        }
    }
}

const endpointCommand = (funcName: string, endpoint: Endpoint) => {
    const cmd = new Command(endpoint.name).description(endpoint.summary || "<undocumented>")

    if (endpoint.input.param) {
        addArgument(cmd, {
            param: endpoint.input.param,
            description: endpoint.input.description,
        })
    } else if (endpoint.input.type === "string") {
        addArgument(cmd, {
            param: "string",
            description: endpoint.input.description,
        })
    }
    if (endpoint.input.type === "object" && endpoint.input.properties) {
        addEndpointOptions(cmd, endpoint)
    }
    if (endpoint.actor !== undefined) {
        cmd.option("-a, --account <name>", "Account to use (instead of the active one)")
    }
    if (endpoint.ifiles === "one") {
        addInputFile(cmd)
    }
    if (endpoint.ofiles === "one") {
        cmd.option("-o, --output <filename>", "Override output filename")
    }
    // TODO(pauek): More files??

    if (endpoint.output) {
        cmd.option("--table", "Output in table format")
        cmd.option("--json", "Output in JSON format")
        cmd.option("--yaml", "Output in YAML format")
        cmd.option("--csv", "Output in CSV format")
        cmd.option("--raw", "Output without formatting")
    }

    cmd.option("--debug", "Show debug information")

    // cmd.action(showArgsAndOptions(funcName))
    cmd.action((...args) => {
        // showArgsAndOptions(funcName, endpoint)(...args)
        callApi(funcName, endpoint)(...args)
    })
    return cmd
}

export const moduleCommand = (module: Module, rootName: string = "") => {
    const prefix = rootName ? `${rootName}.` : ``
    const name = `${prefix}${module.name}`

    const cmd = new Command(module.name)
    cmd.description(getDescription(module.description))

    for (const submodule of module.submodules as Module[]) {
        cmd.addCommand(moduleCommand(submodule, name))
    }

    for (const endpoint of module.endpoints) {
        cmd.addCommand(endpointCommand(`${name}.${endpoint.name}`, endpoint))
    }

    return cmd
}
