import { Command } from '@commander-js/extra-typings'
import print from './print'
import { TablesService } from './client'

export const tablesCmd = new Command('tables').description('Get tables')

tablesCmd
    .command('languages')
    .description(`Display languages table`)
    .action(async () => {
        print.normal(await TablesService.getLanguages())
    })

tablesCmd
    .command('countries')
    .description(`Display countries table`)
    .action(async () => {
        print.normal(await TablesService.getCountries())
    })

tablesCmd
    .command('compilers')
    .description(`Display compilers table`)
    .action(async () => {
        print.normal(await TablesService.getCompilers())
    })

tablesCmd
    .command('drivers')
    .description(`Display drivers table`)
    .action(async () => {
        print.normal(await TablesService.getDrivers())
    })

tablesCmd
    .command('verdicts')
    .description(`Display verdicts table`)
    .action(async () => {
        print.normal(await TablesService.getVerdicts())
    })

tablesCmd
    .command('proglangs')
    .description(`Display proglangs table`)
    .action(async () => {
        print.normal(await TablesService.getProglangs())
    })
