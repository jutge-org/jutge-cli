import { Command } from 'commander'
import axios from 'axios'
import { showResponse } from '@/format'

export const tablesCmd = new Command('tables').description('Get tables')

const tables = 'languages countries compilers drivers verdicts proglangs'.split(' ')

for (const table of tables) {
    tablesCmd
        .command(table)
        .description(`Display ${table} table`)
        .action(async () => {
            showResponse(axios.get(`/tables/${table}`))
        })
}
