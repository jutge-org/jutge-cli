import { Value } from "@sinclair/typebox/value"
import { ApiDir, Endpoint, Module } from "./types-typebox"
import { jsonSchema2Typebox } from "./json-schema-to-typebox"

export const loadDirectory = async () => {
    const response = await fetch("https://api.jutge.org/api/dir")
    const json = await response.json()
    if (process.env.NODE_ENV === "development") {
        await Bun.write(`dir.json`, JSON.stringify(json, null, 2))
    }

    const { info, models, root } = Value.Parse(ApiDir, json)

    const modelMap = new Map(models)

    // Resolve references

    const resolveType = (type: any) => {
        if (type.$ref) {
            return modelMap.get(type.$ref) || type
        } else if (
            type.type === "object" &&
            type.patternProperties &&
            type.patternProperties["^(.*)$"]
        ) {
            const resolved = resolveType(type.patternProperties["^(.*)$"])
            return { ...type, patternProperties: { "^(.*)$": resolved } }
        } else if (type.type === "array") {
            return { ...type, items: resolveType(type.items) }
        } else {
            return type
        }
    }

    const resolveEndpoint = (endpoint: Endpoint) => {
        const input = resolveType(endpoint.input)
        const output = resolveType(endpoint.output)
        return {
            ...endpoint,
            input: jsonSchema2Typebox(input),
            output: jsonSchema2Typebox(output),
        }
    }

    const resolveModule = (module: Module) => {
        return {
            ...module,
            endpoints: module.endpoints.map(resolveEndpoint),
            submodules: module.submodules.map(resolveModule),
        }
    }

    const resolved = { info, root: resolveModule(root) }
    if (process.env.NODE_ENV === "development") {
        await Bun.write(`dir-resolved.json`, JSON.stringify(resolved, null, 2))
    }

    return resolved
}
