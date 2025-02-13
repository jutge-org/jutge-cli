import { Command } from "@commander-js/extra-typings"
import { jutgeApiCall } from "./api-call"
import { Endpoint, Module } from "./directory/type"

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

const addEndpointOptions = (endpointCmd: Command, endpoint: Endpoint) => {
    const required = new Set(endpoint.input.required || [])
    const properties = Object.entries(endpoint.input.properties) as [string, any][]
    for (const [key, prop] of properties) {
        const reqstr = required.has(key) ? " (required)" : ""
        endpointCmd.option(`--${key} <${prop.type}>`, getDescription(prop.description) + reqstr)
    }
}

export const moduleCommand = (module: Module, rootName: string = "") => {
    const prefix = rootName ? `${rootName}.` : ``
    const name = `${prefix}${module.name}`

    const moduleCmd = new Command(module.name).description(getDescription(module.description))

    for (const submodule of module.submodules as Module[]) {
        moduleCmd.addCommand(moduleCommand(submodule, name))
    }

    for (const endpoint of module.endpoints) {
        const funcName = `${name}.${endpoint.name}`
        const endpointCmd = new Command(endpoint.name).description(getDescription(endpoint.summary))

        let endpointAction: (...args: any[]) => void = () => {}

        if (endpoint.input.type === "void" && endpoint.ofiles === "none") {
            endpointAction = async () => {
                const [output] = await jutgeApiCall(funcName, null, [])
                console.log(output)
            }
        } else if (endpoint.input.param) {
            endpointCmd.argument(
                `<${endpoint.input.param}>`,
                getDescription(endpoint.input.description),
            )
            endpointAction = showArgsAndOptions
        } else if (endpoint.input.type === "object" && endpoint.input.properties) {
            addEndpointOptions(endpointCmd, endpoint)
            endpointAction = showArgsAndOptions(funcName)
        } else {
            endpointAction = async () => console.log(`Endpoint "${funcName}" not implemented yet`)
        }

        endpointCmd.action(endpointAction)

        moduleCmd.addCommand(endpointCmd)
    }

    return moduleCmd
}
