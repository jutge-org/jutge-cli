import { config } from './config'
import { Command } from '@commander-js/extra-typings'
import { password as pswd } from '@inquirer/prompts'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ensure_credentials, ensure_initialized } from './base'
import { AuthService } from './client'
import print from './print'

dayjs.extend(relativeTime)

export const authCmd = new Command('auth').description('Auhentication commands')

authCmd
    .command('login')
    .description('Login to Jutge.org')
    .action(async () => {
        ensure_initialized()
        const email = config.get('user.email') as string
        const password = await pswd({
            message: `Password for ${email} at Jutge.org?`,
            mask: true,
        })
        try {
            const credentials = await AuthService.login({
                requestBody: { email, password },
            })
            config.set('credentials', credentials)
            print.success('Login successful')
        } catch (error) {
            print.error('Login unsuccessful')
        }
    })

authCmd
    .command('logout')
    .description('Logout from Jutge.org')
    .action(async () => {
        ensure_credentials()
        try {
            await AuthService.logout()
            config.delete('credentials')
            print.success('Logout successful')
        } catch (error) {
            print.error('Logout unsuccessful')
        }
    })

authCmd
    .command('check')
    .description('Check if logged in at Jutge.org')
    .action(async () => {
        ensure_credentials()
        try {
            const credentials = config.get('credentials', null) as any
            if (!credentials) throw new Error('Not logged in')
            const data = await AuthService.check()
            if (!data.success) throw new Error('Not logged in')
            const remaining = dayjs(credentials.expiration).from(dayjs())
            print.success(`You are logged in (expiration ${remaining})`)
        } catch (error) {
            print.error('You are not logged in')
        }
    })
