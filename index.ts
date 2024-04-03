import { Command } from '@commander-js/extra-typings'
import { config } from './config'
import { initCmd } from './init'
import { apiCmd } from './api'
import { doctorCmd } from './doctor'
import { loginCmd } from './login'
import { checkLoginCmd } from './check-login'
import { logoutCmd } from './logout'
import { profileCmd } from './profile'
import axios from 'axios'

axios.defaults.baseURL = 'https://api.jutge.org'

new Command()
    .name('jutge')
    .description('Jutge.org CLI')
    .version('0.0.1')
    .addCommand(initCmd)
    .addCommand(apiCmd)
    .addCommand(loginCmd)
    .addCommand(logoutCmd)
    .addCommand(checkLoginCmd)
    .addCommand(profileCmd)
    .addCommand(doctorCmd)
    .parse()
