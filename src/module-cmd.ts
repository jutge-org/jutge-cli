import { Command } from "@commander-js/extra-typings"
import { jutgeApiCall } from "./api-call"
import { Endpoint, Module } from "./directory/type"
import { isTableData, printObject, printTable } from "./print"

const getDescription = (description: string | undefined | null) =>
    description ? description.split(`\n`)[0] : "<undocumented>"

const showArgsAndOptions =
    (funcName: string) =>
    async (...args) => {
        const _command = args.pop() as Command
        const options = args.pop()
        console.log(`Calling "${funcName}"`)
        console.log("Args:", JSON.stringify(args, null, 2))
        console.log("Options:", JSON.stringify(options, null, 2))
        console.log("Command: ", _command.name())
    }

const callApi =
    (funcName: string) =>
    async (...args) => {
        args.pop() // Discard command

        let options = args.pop()
        if (Object.keys(options).length === 0) {
            options = null
        }

        // TODO: Convert options to the required type

        let response: [any, any[]] = [null, []]
        if (options === null) {
            response = await jutgeApiCall(funcName, args[0])
        } else {
            response = await jutgeApiCall(funcName, options, args)
        }
        const [result, ofiles] = response

        // Show result
        if (isTableData(result)) {
            printTable(result)
        } else if (typeof result === "object") {
            printObject(result)
        } else {
            console.log(JSON.stringify(result, null, 2))
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
        const srequired = required.has(key) ? " (required)" : ""
        const description = getDescription(prop.description) + srequired
        endpointCmd.option(`--${key} <${prop.type}>`, description)
    }
}

const endpointCommand = (funcName: string, endpoint: Endpoint) => {
    const cmd = new Command(endpoint.name).description(getDescription(endpoint.summary))

    if (endpoint.input.param) {
        addArgument(cmd, endpoint.input)
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
        callApi(funcName)(...args)
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
