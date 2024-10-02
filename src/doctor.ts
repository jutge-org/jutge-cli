import { Command } from '@commander-js/extra-typings'
import print from './print'
import { config } from './config'
import ora from 'ora'
import { sleep } from 'bun'

export const doctorCmd = new Command('doctor')
    .description('Check for potential problems.')
    .action(async () => {
        const init = config.get('init', false)
        if (!init) {
            print.error('jutge-cli not initialized.')
            print.normal('Please run `jutge init` to fix it.')
            process.exit(1)
        }

        const spinner = ora({
            text: 'Pretending to do something useful...',
            color: 'green',
            spinner: 'dots',
        })
        spinner.start()
        await sleep(5000)
        spinner.stop()

        print.normal(`Configuration file: ${config.path}`)
        print.success('Everything seems all right.')
    })
