import { Command } from '@commander-js/extra-typings'
import axios from 'axios'
import print from '@/print'

export const tablesCmd = new Command('tables').description('Get tables')

const tables = 'languages countries compilers drivers verdicts proglangs'.split(' ')

for (const table of tables) {
    tablesCmd
        .command(table)
        .description(`Display ${table} table`)
        .action(async () => {
            print.showResponse(axios.get(`/tables/${table}`))
        })
}
