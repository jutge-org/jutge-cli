import { Command } from '@commander-js/extra-typings'
import { authCmd } from './auth'
import { doctorCmd } from './doctor'
import { initCmd } from './init'
import { miscCmd } from './misc'
import { profileCmd } from './profile'
import { submitCmd } from './submit'
import { tablesCmd } from './tables'
import { pingCmd } from './ping'
import { version } from '../package.json'

new Command()
    .name('jutge')
    .description('Jutge.org CLI')
    .version(version)
    .addCommand(pingCmd)
    .addCommand(miscCmd)
    .addCommand(tablesCmd)
    .addCommand(initCmd)
    .addCommand(authCmd)
    .addCommand(profileCmd)
    .addCommand(doctorCmd)
    .addCommand(submitCmd)
    .parse()
