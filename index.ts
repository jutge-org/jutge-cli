import { Command } from '@commander-js/extra-typings'
import { authCmd } from './auth'
import { doctorCmd } from './doctor'
import { initCmd } from './init'
import { miscCmd } from './misc'
import { profileCmd } from './profile'
import { submitCmd } from './submit'
import { tablesCmd } from './tables'
import { testCmd } from './test'

new Command()
    .name('jutge')
    .description('Jutge.org CLI')
    .version('0.0.1')
    .addCommand(testCmd)
    .addCommand(miscCmd)
    .addCommand(tablesCmd)
    .addCommand(initCmd)
    .addCommand(authCmd)
    .addCommand(profileCmd)
    .addCommand(doctorCmd)
    .addCommand(submitCmd)
    .parse()
