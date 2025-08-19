import { Value } from "@sinclair/typebox/value"
import { JUTGE_API_URL } from "../env"
import { jsonSchema2Typebox } from "./json-schema-to-typebox"
import { ApiDir, Endpoint, Module } from "./types-typebox"

export const loadDirectory = async () => {
    const response = await fetch(`${JUTGE_API_URL}/dir`)
    const json = await response.json()

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

    const resolveEndpoint = (endpoint: Endpoint) => ({
        ...endpoint,
        input: jsonSchema2Typebox(resolveType(endpoint.input)),
        output: jsonSchema2Typebox(resolveType(endpoint.output)),
    })

    const resolveModule = (module: Module) => ({
        ...module,
        endpoints: module.endpoints.map(resolveEndpoint),
        submodules: module.submodules.map(resolveModule),
    })

    return { info, root: resolveModule(root) }
}

export type Directory = Awaited<ReturnType<typeof loadDirectory>>
