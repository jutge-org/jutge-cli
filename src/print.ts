import chalk from "chalk"
import Table from "cli-table3"
import yaml from 'yaml'

export default {
    normal(x: any) {
        console.log(x)
    },

    error(x: any) {
        console.log(chalk.red(x))
    },

    warning(x: any) {
        console.log(chalk.yellow(x))
    },

    success(x: any) {
        console.log(chalk.green(x))
    },

    primary(x: any) {
        console.log(chalk.blue(x))
    },

    verticalTable(data: any) {
        let table = new Table()
        for (const key in data) {
            table.push({ [key]: data[key] })
        }
        console.log(table.toString())
    },

    json(data: any) {
        console.log(JSON.stringify(data, null, 2))
    },

	yaml(data: any) {
		console.log(yaml.stringify(data))
	},

    table(data: Record<string, Record<string, any>>) {
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
    },
}
