import { Command } from "@commander-js/extra-typings"
import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import { File } from "buffer"
import { existsSync } from "fs"
import { readFile, writeFile } from "fs/promises"
import { basename, extname } from "path"
import { applyCredentials, getDefaultFormat } from "./auth/credentials-file"
import { Endpoint, Module } from "./directory/types-typebox"
import { UnauthorizedError } from "./errors"
import { Download, jutgeApiCall } from "./jutge-api-call"
import {
    isArrayOfObjects,
    isDictionaryOfObjects,
    printArrayAsTable,
    printCsv,
    printDictionaryAsTable,
    printJson,
    printObject as printObjectTable,
    printYaml,
} from "./output"
import { printStdout } from "./print"
import { isEmptyObject } from "./utils"

export const TTestcase = Type.Object({
    name: Type.String(),
    input_b64: Type.String(),
    correct_b64: Type.String(),
})
type Testcase = Static<typeof TTestcase>

export type OutputFormat = "json" | "table" | "yaml" | "csv" | "raw" | null

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
    printStdout(`Wrote '${filename}'`)
}

const writeTestcase = async (testcases: Testcase[]) => {
    for (const testcase of testcases) {
        const { name, input_b64, correct_b64 } = testcase
        const base = name.replace(/.inp$/, "")
        await writeOutputFile(`${base}.inp`, Buffer.from(input_b64, "base64"))
        await writeOutputFile(`${base}.cor`, Buffer.from(correct_b64, "base64"))
    }
}

const parseOptionValue = (tschema: any, value: any) => {
    if (tschema.type === "object" || tschema.type === "array") {
        // First convert value to a Javascript object from JSON
        value = JSON.parse(value)
    }
    return Value.Parse(tschema, value)
}

const parseArgs = async (
    args: any[],
    rawOptions: Record<string, string> | null,
    endpoint: Endpoint,
) => {
    if (rawOptions && Object.keys(rawOptions).length === 0) {
        rawOptions = null
    }

    let inputFiles: File[] = []
    let params: any[] = []
    let options: Record<string, any> = {}

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
                options[key] = Value.Parse(Type.Boolean(), rawOptions![key])
                break
            case "account":
            case "output": {
                options[key] = Value.Parse(Type.String(), rawOptions![key])
                break
            }
            default:
                options[key] = rawOptions![key]
                break
        }
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
                const optionValue = rawOptions![key]
                const value = parseOptionValue(tschema, optionValue)
                options[key] = value
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

    return {
        params,
        options: isEmptyObject(options) ? null : options,
        ifiles: inputFiles,
    }
}

const showResultDeducingFormat = async (output: any) => {
    if (Value.Check(Type.Array(TTestcase), output)) {
        // FIXME(pauek): This is a little ugly, we make an exception for TTestcase (test cases for problems)
        await writeTestcase(output)
    } else if (isDictionaryOfObjects(output)) {
        printDictionaryAsTable(output)
    } else if (isArrayOfObjects(output)) {
        printArrayAsTable(output)
    } else if (typeof output === "object") {
        printObjectTable(output)
    } else {
        printStdout(output)
    }
}

const printTable = async (output: any) => {
    if (isDictionaryOfObjects(output)) {
        printDictionaryAsTable(output)
    } else if (isArrayOfObjects(output)) {
        printArrayAsTable(output)
    } else if (typeof output === "object") {
        printObjectTable(output)
    } else {
        printStdout(`warning: data does not seem to fit into a table`)
        printStdout(output)
    }
}

const showResult = async (output: any, format: OutputFormat) => {
    const userDefault = await getDefaultFormat()

    const wantFormat = (f: OutputFormat) => format === f || (format === null && userDefault === f)

    if (wantFormat("raw")) {
        printStdout(output)
    } else if (wantFormat("json")) {
        printJson(output)
    } else if (wantFormat("yaml")) {
        printYaml(output)
    } else if (wantFormat("csv")) {
        printCsv(output)
    } else if (wantFormat("table")) {
        printTable(output)
    } else {
        showResultDeducingFormat(output)
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

    if (endpoint.actor !== undefined) {
        if (options && options.account) {
            // Treat -a, --account specially
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
    async (args: any[], rawOptions: Record<string, any>) => {
        const parsed = await parseArgs(args, rawOptions, endpoint)
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
    let numArgs = 0

    if (endpoint.input.param) {
        addArgument(cmd, {
            param: endpoint.input.param,
            description: endpoint.input.description,
        })
        numArgs++
    } else if (endpoint.input.type === "string") {
        addArgument(cmd, {
            param: "string",
            description: endpoint.input.description,
        })
        numArgs++
    }
    if (endpoint.input.type === "object" && endpoint.input.properties) {
        addEndpointOptions(cmd, endpoint)
    }
    if (endpoint.actor !== undefined) {
        cmd.option("-a, --account <name>", "Account to use (instead of the active one)")
    }
    if (endpoint.ifiles === "one") {
        addInputFile(cmd)
        numArgs++;
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
        callApi(funcName, endpoint)(args.slice(0, numArgs), args[numArgs])
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
