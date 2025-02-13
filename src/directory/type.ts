import { z } from "zod"

const zType = z.any()

export const zEndpoint = z.object({
    name: z.string(),
    summary: z.string(),
    description: z.string().optional(),
    input: zType,
    output: zType,
    ifiles: z.string(),
    ofiles: z.string(),
})

// https://zod.dev/?id=recursive-types

export const zModule = z.object({
    name: z.string(),
    description: z.string().optional(),
    endpoints: zEndpoint.array(),
    submodules: z.lazy(() => zModule.array()),
})

export const zProperty = z.object({
    type: z.string().optional(),
    format: z.string().optional(),
    error: z.string().optional(),
    description: z.string().optional(),
    anyOf: z.lazy(() => zProperty.array()).optional(),
})

export const zModel = z.tuple([
    z.string(),
    z.object({
        type: z.string().optional(),
        properties: z.record(z.string(), zProperty).optional(),
        required: z.string().array().optional(),
    }),
])

export const zDirectory = z.object({
    info: z.object({
        name: z.string(),
        description: z.string(),
        version: z.string().regex(/^\d+\.\d+\.\d+$/),
        url: z.string().url(),
    }),
    models: zModel.array(),
    root: zModule,
})

export type Directory = ReturnType<typeof zDirectory.parse>
export type Module = ReturnType<typeof zModule.parse>
export type Endpoint = ReturnType<typeof zEndpoint.parse>
