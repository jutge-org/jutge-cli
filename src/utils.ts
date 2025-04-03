export const isObject = (x: any) => x && typeof x === "object" && !Array.isArray(x)

export const isEmptyObject = (x: any) => isObject(x) && Object.keys(x).length === 0