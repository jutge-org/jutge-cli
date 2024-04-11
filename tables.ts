import { Command } from '@commander-js/extra-typings'
import print from '@/print'
import { TablesService } from './client'

export const tablesCmd = new Command('tables').description('Get tables')

tablesCmd
    .command('languages')
    .description(`Display languages table`)
    .action(async () => {
        print.normal(await TablesService.getTablesLanguages())
    })

tablesCmd
    .command('countries')
    .description(`Display countries table`)
    .action(async () => {
        print.normal(await TablesService.getTablesCountries())
    })

tablesCmd
    .command('compilers')
    .description(`Display compilers table`)
    .action(async () => {
        print.normal(await TablesService.getTablesCompilers())
    })

tablesCmd
    .command('drivers')
    .description(`Display drivers table`)
    .action(async () => {
        print.normal(await TablesService.getTablesDrivers())
    })

tablesCmd
    .command('verdicts')
    .description(`Display verdicts table`)
    .action(async () => {
        print.normal(await TablesService.getTablesVerdicts())
    })

tablesCmd
    .command('proglangs')
    .description(`Display proglangs table`)
    .action(async () => {
        print.normal(await TablesService.getTablesProglangs())
    })
