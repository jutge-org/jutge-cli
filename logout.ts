import { config } from '@/config'
import { Command } from '@commander-js/extra-typings'
import { ensure_credentials } from './base'
import { AuthenticationService } from './client'

export const logoutCmd = new Command('logout')
    .description('Logout from Jutge.org')
    .action(async () => {
        ensure_credentials()
        try {
            await AuthenticationService.postAuthenticationLogout()
            config.delete('credentials')
            console.log('Logout successful')
        } catch (error) {
            console.error('Logout unsuccessful')
        }
    })
