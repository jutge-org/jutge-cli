import { Command } from '@commander-js/extra-typings'
import { miscCmd } from './misc'
import { testCmd } from './test'
import { tablesCmd } from './tables'

export const apiCmd = new Command('api')
    .description('Direct API commands')
    .addCommand(miscCmd)
    .addCommand(testCmd)
    .addCommand(tablesCmd)
