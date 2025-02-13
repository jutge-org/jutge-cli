import { Endpoint, Module, zDirectory, zModule } from "./type"

export const loadDirectory = async () => {
    const response = await fetch("https://api.jutge.org/api/dir")
    const json = await response.json()
    const { info, models, root } = zDirectory.parse(json)

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
        } else {
            return type
        }
    }

    const resolveEndpoint = (endpoint: Endpoint) => {
        return {
            ...endpoint,
            input: resolveType(endpoint.input),
            output: resolveType(endpoint.output),
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
    await Bun.write(`dir.json`, JSON.stringify(resolved, null, 2))

    return resolved
}
