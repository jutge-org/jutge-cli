import { Command } from "@commander-js/extra-typings"
import { Value } from "@sinclair/typebox/value"
import { jutgeApiCall } from "./api-call"
import { Endpoint, Module } from "./directory/types-typebox"
import { isTableData, printObject, printTable } from "./print"

const getDescription = (description: string | undefined | null) =>
    description ? description.split(`\n`)[0] : "<undocumented>"

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

const parseArgs = (args: any[], endpoint: Endpoint) => {
    // args = [params..., options, command]
    args.pop() // Discard command

    let rawOptions: Record<string, any> | null = args.pop()
    // NOTE: Should we check that it is an object?
    if (rawOptions && Object.keys(rawOptions).length === 0) {
        rawOptions = null
    }

    let params: any[] = []
    let options: Record<string, any> | null = null
    const { input } = endpoint
    if (input.type === "object") {
        // The properties are the options in the command
        if (input.properties) {
            options = {}
            let required = new Set<string>()
            if (input.required) {
                required = new Set(input.required)
            }
            const properties = Object.entries(input.properties) as [string, any][]
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
        // NOTE(pauek): 'void' is part of JSON
        // In the API, the input is a single thing.
        // There can't be more than one parameter
        params = [undefined]
    } else {
        params = [Value.Parse(input, args[0])]
    }

    return { params, options }
}

const callApi =
    (funcName: string, endpoint: Endpoint) =>
    async (...args) => {
        const { params, options } = parseArgs(args, endpoint)

        let response: [any, any[]] = [null, []]
        if (options === null) {
            response = await jutgeApiCall(funcName, params[0])
        } else {
            response = await jutgeApiCall(funcName, options, args)
        }
        const [output, ofiles] = response

        // Show result
        if (isTableData(output)) {
            printTable(output)
        } else if (typeof output === "object") {
            printObject(output)
        } else {
            console.log(output)
        }

        // FIXME: Save files instead of showing them
        if (ofiles.length > 0) {
            console.log(ofiles)
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
    const cmd = new Command(endpoint.name).description(getDescription(endpoint.summary))

    if (endpoint.input.param) {
        addArgument(cmd, endpoint.input)
    } else if (endpoint.input.type === "string") {
        addArgument(cmd, { param: "string", description: "Input string" })
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
