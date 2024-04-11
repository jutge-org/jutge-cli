import { Command } from '@commander-js/extra-typings'
import print from '@/print'
import { MiscService } from './client'

export const miscCmd = new Command('misc').description('Miscellaneous commands')

miscCmd
    .command('time')
    .description('Display server time')
    .action(async () => {
        print.normal(await MiscService.getTime())
    })

miscCmd
    .command('fortune')
    .description('Display a fortune cookie')
    .action(async () => {
        print.normal(await MiscService.getFortune())
    })

miscCmd
    .command('homepage-statistics')
    .description('Get homepage statistics​')
    .action(async () => {
        print.normal(await MiscService.getHomepageStatistics())
    })
