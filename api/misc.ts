import { Command } from '@commander-js/extra-typings'
import axios from 'axios'
import { showResponse } from '@/format'

export const miscCmd = new Command('misc').description('Miscellaneous commands')

miscCmd
    .command('time')
    .description('Display server time')
    .action(async () => {
        showResponse(axios.get('/misc/time'))
    })

miscCmd
    .command('fortune')
    .description('Display a fortune cookie')
    .action(async () => {
        showResponse(axios.get('/misc/fortune'))
    })

miscCmd
    .command('homepage-statistics')
    .description('Get homepage statistics​')
    .action(async () => {
        showResponse(axios.get('/misc/homepage-statistics'))
    })
