import { Command } from 'commander'
import { miscCmd } from './misc'
import { testCmd } from './test'
import { tablesCmd } from './tables'

export const apiCmd = new Command('api').description('Direct API commands')

apiCmd.addCommand(miscCmd).addCommand(testCmd).addCommand(tablesCmd)
