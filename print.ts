import type { AxiosResponse } from 'axios'
import chalk from 'chalk'
import Table from 'cli-table3'

export default {
    showResponse: async (promise: Promise<AxiosResponse<any, any>>) => {
        const response = await promise
        if (response.status !== 200) {
            console.error(`Error: ${response.status} ${response.statusText}`)
        } else if (response.data.message !== undefined) {
            console.log(response.data.message)
        } else {
            console.log(response.data)
        }
    },

    normal: (s: string) => {
        console.log(s)
    },

    error: (s: string) => {
        console.log(chalk.red(s))
    },

    warning: (s: string) => {
        console.log(chalk.yellow(s))
    },

    success: (s: string) => {
        console.log(chalk.green(s))
    },

    primary: (s: string) => {
        console.log(chalk.blue(s))
    },

    verticalTable: (data: any) => {
        var table = new Table()
        for (const key in data) {
            table.push({ [key]: data[key] })
        }
        console.log(table.toString())
    },
}
