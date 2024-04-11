import { config } from '@/config'
import { Command } from '@commander-js/extra-typings'
import { input, password as pswd } from '@inquirer/prompts'
import print from './print'
import { ensure_initialized } from './base'
import { AuthenticationService } from './client'

export const loginCmd = new Command('login').description('Login to Jutge.org').action(async () => {
    ensure_initialized()
    const email = config.get('user.email') as string
    const password = await pswd({
        message: `Password for ${email} at Jutge.org?`,
        mask: true,
    })
    try {
        const credentials = await AuthenticationService.postAuthenticationLogin({
            requestBody: { email, password },
        })
        config.set('credentials', credentials)
        print.success('Login successful')
    } catch (error) {
        print.error('Login unsuccessful')
    }
})
