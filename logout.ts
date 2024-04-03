import { config } from '@/config'
import { Command } from '@commander-js/extra-typings'
import axios from 'axios'
import { ensure_credentials } from './base'

export const logoutCmd = new Command('logout')
    .description('Logout from Jutge.org')
    .action(async () => {
        ensure_credentials()
        try {
            await axios.post('/authentication/logout')
            config.delete('credentials')
            console.log('Logout successful')
        } catch (error) {
            console.error('Logout unsuccessful')
        }
    })
