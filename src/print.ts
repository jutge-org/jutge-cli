import chalk from "chalk"
import Table from "cli-table3"
import yml from "yaml"

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

export const json = (data: any) => {
    console.log(JSON.stringify(data, null, 2))
}

export const yaml = (data: any) => {
    console.log(yml.stringify(data))
}

export const table = (data: Record<string, Record<string, any>>) => {
    const MAX_COL_WIDTH = 70
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
