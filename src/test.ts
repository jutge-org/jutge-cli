import { Command } from '@commander-js/extra-typings'
import { MiscService } from './client'
import print from './print'

export const testCmd = new Command('test').description('Testing commands')

testCmd
    .command('ping')
    .description('Ping to get a Pong')
    .action(async (str) => {
        print.normal(await MiscService.ping())
    })
