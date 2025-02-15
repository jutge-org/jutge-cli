import { Command } from "@commander-js/extra-typings"
import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import { readFile, writeFile } from "fs/promises"
import { basename } from "path"
import { removeCredentials, saveCredentials } from "./credentials"
import { Endpoint, Module } from "./directory/types-typebox"
import { Download, jutgeApiCall } from "./jutge-api-call"
import { isTableData, printObject, printTable } from "./output"

export const TTestcase = Type.Object({
    name: Type.String(),
    input_b64: Type.String(),
    correct_b64: Type.String(),
})
type Testcase = Static<typeof TTestcase>

const getDescription = (description: string | undefined | null) =>
    description ? description.split(`\n`)[0] : "<undocumented>"

const writeOutputFile = async (filename: string, content: any) => {
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

    const { input, ifiles } = endpoint

    if (ifiles === "one") {
        const filename = args[0]
        const bytes = await readFile(filename)
        inputFiles.push(new File([bytes], basename(filename)))
    }

    if (input.type === "object") {
        // The properties are the options in the command
        if (input.properties) {
            options = {}
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

    return { params, options, ifiles: inputFiles }
}

const showResult = async (output: any) => {
    // Show result
    if (isTableData(output)) {
        printTable(output)
    } else if (typeof output === "object" && !Array.isArray(output)) {
        printObject(output)
    } else if (Value.Check(Type.Array(TTestcase), output)) {
        // FIXME(pauek): This is a little ugly, we make an exception for TTestcase (test cases for problems)
        await writeTestcase(output)
    } else if (output) {
        console.log(output)
    }
}

const writeOutputFiles = async (ofiles: Download[]) => {
    if (ofiles.length > 0) {
        for (const { name, content } of ofiles) {
            await writeOutputFile(name, content)
        }
    }
}

const callApi =
    (funcName: string, endpoint: Endpoint) =>
    async (...args) => {
        const { params, options, ifiles } = await parseArgs(args, endpoint)

        let response: [any, Download[]] = [null, []]
        if (options === null) {
            response = await jutgeApiCall(funcName, params[0], ifiles)
        } else {
            response = await jutgeApiCall(funcName, options, ifiles)
        }

        const [output, ofiles] = response
        if (funcName === "auth.login") {
            // Intercept "auth.login" to save credentials
            await saveCredentials(output)
        } else if (funcName === "auth.logout") {
            // Intercept "auth.logout" to remove credentials
            await removeCredentials()
        } else {
            await showResult(output)
            await writeOutputFiles(ofiles)
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
    if (endpoint.ifiles === "one") {
        addInputFile(cmd)
    }

    // cmd.action(showArgsAndOptions(funcName))
    cmd.action((...args) => {
        // showArgsAndOptions(funcName)(...args)
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
