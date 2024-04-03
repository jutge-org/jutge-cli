import { Command } from '@commander-js/extra-typings'
import print from '@/print'
import { config } from '@/config'

export const doctorCmd = new Command('doctor')
    .description('Check for potential problems.')
    .action(() => {
        const init = config.get('init', false)
        if (!init) {
            print.error('jutge-cli not initialized.')
            print.normal('Please run `jutge init` to fix it.')
            process.exit(1)
        }
        print.success('Everything seems all right.')
    })
