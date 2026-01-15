import { type TSchema, Type } from '@sinclair/typebox'

export const jsonSchema2Typebox = (schema: any): TSchema => {
    if (schema.type === 'object') {
        if (schema.properties) {
            const required = new Set(schema.required || [])
            const properties = Object.entries(schema.properties)
            const typeboxProps: Record<string, TSchema> = {}
            for (const [key, value] of properties) {
                typeboxProps[key] = jsonSchema2Typebox(value)
                if (!required.has(key)) {
                    typeboxProps[key] = Type.Optional(typeboxProps[key])
                }
            }
            return Type.Object(typeboxProps)
        } else if (schema.patternProperties) {
            return Type.Object({
                '^(.*)$': jsonSchema2Typebox(schema.patternProperties['^(.*)$']),
            })
        } else {
            throw new Error(`Object without properties or patternProperties!`)
        }
    } else if (schema.type === 'array') {
        return Type.Array(jsonSchema2Typebox(schema.items))
    } else if (schema.type === 'string') {
        return Type.String({
            default: schema.default,
            description: schema.description,
            param: schema.param,
            examples: schema.examples,
        })
    } else if (schema.type === 'number' || schema.type === 'integer') {
        return Type.Number({
            default: schema.default,
            description: schema.description,
            param: schema.param,
            examples: schema.examples,
        })
    } else if (schema.type === 'boolean') {
        return Type.Boolean({
            default: schema.default,
            description: schema.description,
            param: schema.param,
            examples: schema.examples,
        })
    } else if (schema.type === 'null') {
        return Type.Null()
    } else {
        return Type.Any({
            default: schema.default,
            description: schema.description,
            param: schema.param,
            examples: schema.examples,
        })
    }
}
