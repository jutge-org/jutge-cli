export type FilesOptions = 'none' | 'one' | 'many'

export type ApiModels = [string, any][]

export type ApiDir = {
    info: ApiInfo
    root: Module
    models: ApiModels
}

export type ApiInfo = {
    name: string
    description: string
    version: string
    url: string
}

export type Module = {
    name: string
    description?: string
    hideFromDoc?: boolean
    endpoints: Endpoint[]
    submodules: Module[]
}

export type Endpoint = {
    status?: string
    name: string
    summary?: string
    description?: string
    actor?: string
    input: any
    output: any
    ifiles?: FilesOptions
    ofiles?: FilesOptions
    clientTtl?: number
}
