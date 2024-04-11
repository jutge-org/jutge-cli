import { Command } from '@commander-js/extra-typings'
import print from '@/print'
import { TestService } from './client'

export const testCmd = new Command('test').description('Testing commands')

testCmd
    .command('ping')
    .description('Ping to get a Pong')
    .action(async (str) => {
        print.normal(await TestService.getTestPing())
    })

testCmd
    .command('upper')
    .description('Get string in uppercase')
    .argument('<string>', 'String to convert to uppercase')
    .action(async (str) => {
        print.normal(await TestService.getTestUpper({ str }))
    })

testCmd
    .command('do-not-try')
    .description('Do not try')
    .action(async () => {
        print.normal(await TestService.getTestDoNotTry())
    })
