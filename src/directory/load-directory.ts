import { Value } from '@sinclair/typebox/value'
import { JUTGE_API_URL } from '../env'
import { jsonSchema2Typebox } from './json-schema-to-typebox'
import { ApiDir, Endpoint, Module } from './types-typebox'

export const loadDirectory = async () => {
    const response = await fetch(`${JUTGE_API_URL}/dir`)
    const json = await response.json()

    const { info, models, root } = Value.Parse(ApiDir, json)

    const modelMap = new Map(models)

    // Resolve references

    const resolveSchema = (schema: any): any => {
        if (schema.$ref) {
            return resolveSchema(modelMap.get(schema.$ref)) || schema
        } else if (schema.anyOf) {
            return { anyOf: (schema.anyOf as any[]).map(resolveSchema) }
        } else if (
            schema.type === "object" &&
            schema.patternProperties &&
            schema.patternProperties["^(.*)$"]
        ) {
            const resolved: any = resolveSchema(schema.patternProperties["^(.*)$"])
            return { ...schema, patternProperties: { "^(.*)$": resolved } }
        } else if (schema.type === "object" && schema.properties) {
            const properties: any = Object.fromEntries(
                Object.entries(schema.properties).map(([key, prop]): [string, any] => [key, resolveSchema(prop)]),
            )
            return { ...schema, properties }
        } else if (schema.type === "array") {
            return { ...schema, items: resolveSchema(schema.items) }
        } else {
            return schema
        }
    }

    const resolveEndpoint = (endpoint: Endpoint) => ({
        ...endpoint,
        input: jsonSchema2Typebox(resolveSchema(endpoint.input)),
        output: jsonSchema2Typebox(resolveSchema(endpoint.output)),
    })

    const resolveModule = (module: Module): any => ({
        ...module,
        endpoints: module.endpoints.map(resolveEndpoint),
        submodules: module.submodules.map(resolveModule),
    })

    const dirResolved = { info, root: resolveModule(root) }

    await Bun.write(`dir-resolved.json`, JSON.stringify(dirResolved, null, 4))

    return dirResolved
}

export type Directory = Awaited<ReturnType<typeof loadDirectory>>
