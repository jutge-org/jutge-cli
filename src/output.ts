import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import chalk from "chalk"
import Table from "cli-table3"
import yml from "yaml"
import { isObject } from "./utils"

export const TTestcase = Type.Object({
    name: Type.String(),
    input_b64: Type.String(),
    correct_b64: Type.String(),
})
type Testcase = Static<typeof TTestcase>

export const normal = (x: any) => console.log(x)
export const error = (x: any) => console.log(chalk.red(x))

export const warning = (x: any) => {
    console.log(chalk.yellow(x))
}

export const success = (x: any) => {
    console.log(chalk.green(x))
}

export const primary = (x: any) => {
    console.log(chalk.blue(x))
}

export const verticalTable = (data: any) => {
    let table = new Table()
    for (const key in data) {
        table.push({ [key]: data[key] })
    }
    console.log(table.toString())
}

export const printJson = (data: any) => {
    console.log(JSON.stringify(data, null, 2))
}

export const printYaml = (data: any) => {
    console.log(yml.stringify(data))
}

export const printCsv = (data: any) => {
    const printValue = (value: any) => {
        return typeof value === "string" ? `"${value}"` : value
    }
    if (typeof data === "object" && !Array.isArray(data)) {
        const keys = Object.keys(data)
        console.log(keys.join(";"))
        console.log(keys.map((k) => printValue(data[k])).join(";"))
    }
}

const MAX_COL_WIDTH = 80

export const printTable = (data: Record<string, Record<string, any>>) => {
    const numItems = Object.keys(data).length
    if (numItems > 0) {
        const entries = Object.entries(data)
        const head = Object.keys(entries[0][1])

        // Compute the maximum widths and truncate them if they are too long
        let maxWidths = head.map((h) => h.length + 2)
        for (const [_, value] of entries) {
            const lengths = Object.values(value).map((x) => String(x).length + 2)
            maxWidths = maxWidths.map((mx, j) => Math.max(mx, lengths[j]))
        }
        const colWidths = maxWidths.map((x) => Math.min(x, MAX_COL_WIDTH))

        // Create the table and fill it
        const table = new Table({ head, wordWrap: true, colWidths })
        for (const [_, value] of entries) {
            table.push(Object.values(value))
        }

        // Print it
        console.log(table.toString())
    }
}

export const printObject = (data: Record<string, any>) => {
    const strValue = (value: any) => (isObject(value) ? JSON.stringify(value) : String(value))

    const numItems = Object.keys(data).length
    if (numItems > 0) {
        const entries = Object.entries(data)

        // Compute the maximum widths and truncate them if they are too long
        let maxWidths = [0, 0]
        for (const [key, value] of entries) {
            maxWidths = [
                Math.max(maxWidths[0], key.length + 2),
                Math.max(maxWidths[1], strValue(value).length + 2),
            ]
        }
        const colWidths = maxWidths.map((x) => Math.min(x, MAX_COL_WIDTH))

        // Create the table and fill it
        const table = new Table({ wordWrap: true, colWidths })
        for (const [key, value] of entries) {
            table.push({ [key]: strValue(value) })
        }

        // Print it
        console.log(table.toString())
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

export const isTableData = (data: any) => {
    if (typeof data !== "object") {
        return false
    }
    if (Array.isArray(data)) {
        return false
    }
    let columns: string[] = []
    for (const key in data) {
        const cols = Object.keys(data[key])
        if (columns.length === 0) {
            columns = cols
        } else if (!arrayEqual(columns, cols)) {
            return false
        }
        if (typeof data[key] !== "object") {
            return false
        }
    }
    return true
}

const writeTestcase = async (testcases: Testcase[]) => {
    for (const testcase of testcases) {
        const { name, input_b64, correct_b64 } = testcase
        const base = name.replace(/.inp$/, "")
        await writeFile(`${base}.inp`, Buffer.from(input_b64, "base64"))
        await writeFile(`${base}.cor`, Buffer.from(correct_b64, "base64"))
    }
}

export const printApiOutput = async (output: any) => {
    if (isTableData(output)) {
        printTable(output)
    } else if (typeof output === "object" && !Array.isArray(output)) {
        printObject(output)
    } else if (Value.Check(Type.Array(TTestcase), output)) {
        // FIXME(pauek): This is a little ugly, we make an exception for TTestcase (test cases for problems)
        await writeTestcase(output)
    } else if (output) {
        console.log(output)
    }
}

const writeFile = async (filename: string, content: any) => {
    await Bun.write(filename, content)
    console.log(`Wrote '${filename}'`)
}

export const writeFiles = async (ofiles: { content: Uint8Array; name: string }[]) => {
    if (ofiles.length > 0) {
        for (const { name, content } of ofiles) {
            await writeFile(name, content)
        }
    }
}
