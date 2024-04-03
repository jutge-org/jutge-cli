import { Command } from '@commander-js/extra-typings'
import axios from 'axios'
import { showResponse } from '@/format'

export const testCmd = new Command('test').description('Testing commands')

testCmd
    .command('ping')
    .description('Ping to get a Pong')
    .action(async (str) => {
        showResponse(axios.get('/test/ping'))
    })

testCmd
    .command('upper')
    .description('Get string in uppercase')
    .argument('<string>', 'String to convert to uppercase')
    .action(async (str) => {
        showResponse(axios.get('/test/upper', { params: { str } }))
    })

testCmd
    .command('do-not-try')
    .description('Do not try')
    .action(async () => {
        showResponse(axios.get('/test/do-not-try'))
    })
