import { config } from '@/config'
import { Command } from '@commander-js/extra-typings'
import { input, password as pswd } from '@inquirer/prompts'
import axios from 'axios'
import print from './print'
import { ensure_initialized } from './base'

export const loginCmd = new Command('login').description('Login to Jutge.org').action(async () => {
    ensure_initialized()
    const email = config.get('user.email') as string
    const password = await pswd({
        message: `Password for ${email} at Jutge.org?`,
        mask: true,
    })
    try {
        const response = await axios.post('/authentication/login', { email, password })
        config.set('credentials', response.data)
        print.success('Login successful')
    } catch (error) {
        print.error('Login unsuccessful')
    }
})
