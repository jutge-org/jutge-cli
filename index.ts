import { Command } from 'commander'
import { apiCmd } from './api'
import { helloCmd } from './hello'
import axios from 'axios'

axios.defaults.baseURL = 'https://api.jutge.org'

new Command().name('jutge').description('Jutge CLI').version('0.0.1').addCommand(helloCmd).addCommand(apiCmd).parse()
