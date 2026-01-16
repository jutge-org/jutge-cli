import { type Static, Type } from '@sinclair/typebox'
import Table from 'cli-table3'
import yml from 'yaml'
import { printStdout } from './print'
import { isObject } from './utils'

export const TTestcase = Type.Object({
    name: Type.String(),
    input_b64: Type.String(),
    correct_b64: Type.String(),
})
type Testcase = Static<typeof TTestcase>

export const verticalTable = (data: any) => {
    const table = new Table()
    for (const key in data) {
        table.push({ [key]: data[key] })
    }
    printStdout(table.toString())
}

export const printJson = (data: any) => {
    printStdout(JSON.stringify(data, null, 2))
}

export const printYaml = (data: any) => {
    printStdout(yml.stringify(data))
}

export const printCsv = (data: any) => {
    const printValue = (value: any) => {
        return typeof value === 'string' ? `"${value}"` : value
    }
    if (typeof data === 'object' && !Array.isArray(data)) {
        const keys = Object.keys(data)
        printStdout(keys.join(';'))
        printStdout(keys.map((k) => printValue(data[k])).join(';'))
    }
}

const MAX_COL_WIDTH = 80

export const printDictionaryAsTable = (data: Record<string, Record<string, any>>) => {
    printArrayAsTable(Object.values(data))
}

export const printArrayAsTable = (data: Record<string, any>[]) => {
    const first = data[0]
    if (!first) return

    const head = Object.keys(first)

    // Compute the maximum widths and truncate them if they are too long
    let maxWidths = head.map((h) => h.length + 2)
    for (const value of data) {
        const lengths = Object.values(value).map((x) => String(x).length + 2)
        maxWidths = maxWidths.map((mx, j) => Math.max(mx, lengths[j] ?? 0))
    }
    // Compute the max width of the '#' (index) column
    const indexWidth = String(data.length).length + 2
    const colWidths = [indexWidth, ...maxWidths].map((x) => Math.min(x, MAX_COL_WIDTH))

    // Create the table and fill it
    const table = new Table({ head: ['#', ...head], wordWrap: true, colWidths })
    for (const [i, row] of data.entries()) {
        table.push([i + 1, ...Object.values(row)])
    }

    // Print it
    printStdout(table.toString())
}

export const printObject = (data: Record<string, any>) => {
    const strValue = (value: any) => (isObject(value) ? JSON.stringify(value) : String(value))

    const numItems = Object.keys(data).length
    if (numItems > 0) {
        const entries = Object.entries(data)

        // Compute the maximum widths and truncate them if they are too long
        let maxWidths = [0, 0]
        for (const [key, value] of entries) {
            maxWidths = [Math.max(maxWidths[0]!, key.length + 2), Math.max(maxWidths[1]!, strValue(value).length + 2)]
        }
        const colWidths = maxWidths.map((x) => Math.min(x, MAX_COL_WIDTH))

        // Create the table and fill it
        const table = new Table({ wordWrap: true, colWidths })
        for (const [key, value] of entries) {
            table.push({ [key]: strValue(value) })
        }

        // Print it
        printStdout(table.toString())
    }
}

const sameElements = <T>(a: Set<T>, b: Set<T>) => {
    if (a.size !== b.size) {
        return false
    }
    for (const elem of a) {
        if (!b.has(elem)) {
            return false
        }
    }
    return true
}

const arrayEqual = (a: any[], b: any[]) => {
    return a.length === b.length && sameElements(new Set(a), new Set(b))
}

const sameColumns = (objects: Record<string, any>[]) => {
    const [first, ...rest] = objects
    if (typeof first !== 'object' || first === null) {
        return false
    }
    const firstColumns: string[] = Object.keys(first)
    for (const value of rest) {
        if (typeof value !== 'object' || value === null) {
            return false
        }
        const columns = Object.keys(value)
        if (!arrayEqual(firstColumns, columns)) {
            return false
        }
    }
    return true
}

export const isDictionaryOfObjects = (data: any) => {
    if (typeof data !== 'object' || Array.isArray(data)) {
        return false
    }
    return sameColumns(Object.values(data))
}

export const isArrayOfObjects = (data: any) => {
    if (!Array.isArray(data)) {
        return false
    }
    return sameColumns(data)
}

const writeTestcase = async (testcases: Testcase[]) => {
    for (const testcase of testcases) {
        const { name, input_b64, correct_b64 } = testcase
        const base = name.replace(/.inp$/, '')
        await writeFile(`${base}.inp`, Buffer.from(input_b64, 'base64'))
        await writeFile(`${base}.cor`, Buffer.from(correct_b64, 'base64'))
    }
}

const writeFile = async (filename: string, content: any) => {
    await Bun.write(filename, content)
    printStdout(`Wrote '${filename}'`)
}

export const writeFiles = async (ofiles: { content: Uint8Array; name: string }[]) => {
    if (ofiles.length > 0) {
        for (const { name, content } of ofiles) {
            await writeFile(name, content)
        }
    }
}
