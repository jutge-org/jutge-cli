import { Command } from '@commander-js/extra-typings'
import axios from 'axios'
import print from './print'
import { ensure_credentials } from './base'

export const profileCmd = new Command('profile').description('Show profile').action(async () => {
    ensure_credentials()
    const { data } = await axios.get('/my/profile')
    print.verticalTable(data)
})
