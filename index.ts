import { Command } from '@commander-js/extra-typings'
import { config } from './config'
import { initCmd } from './init'
import { testCmd } from './test'
import { miscCmd } from './misc'
import { tablesCmd } from './tables'
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
    .addCommand(testCmd)
    .addCommand(miscCmd)
    .addCommand(tablesCmd)
    .addCommand(initCmd)
    .addCommand(loginCmd)
    .addCommand(logoutCmd)
    .addCommand(checkLoginCmd)
    .addCommand(profileCmd)
    .addCommand(doctorCmd)
    .parse()
