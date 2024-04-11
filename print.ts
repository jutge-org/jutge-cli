import chalk from 'chalk'
import Table from 'cli-table3'

export default {
    normal: (x: any) => {
        console.log(x)
    },

    error: (x: any) => {
        console.log(chalk.red(x))
    },

    warning: (x: any) => {
        console.log(chalk.yellow(x))
    },

    success: (x: any) => {
        console.log(chalk.green(x))
    },

    primary: (x: any) => {
        console.log(chalk.blue(x))
    },

    verticalTable: (data: any) => {
        var table = new Table()
        for (const key in data) {
            table.push({ [key]: data[key] })
        }
        console.log(table.toString())
    },
}
