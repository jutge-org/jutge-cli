import { config } from '@/config'
import { Command } from '@commander-js/extra-typings'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ensure_credentials, ensure_initialized } from './base'
import { AuthenticationService } from './client'

dayjs.extend(relativeTime)

export const checkLoginCmd = new Command('check-login')
    .description('Check if logged in at Jutge.org')
    .action(async () => {
        ensure_credentials()
        try {
            const credentials = config.get('credentials', null) as any
            if (!credentials) throw new Error('Not logged in')
            const data = await AuthenticationService.getAuthenticationCheck()
            if (!data.success) throw new Error('Not logged in')
            const remaining = dayjs(credentials.expiration).from(dayjs())
            console.log(`You are logged in (expiration ${remaining})`)
        } catch (error) {
            console.error('You are not logged in')
        }
    })
