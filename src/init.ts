import { config } from './config'
import print from './print'
import { Command } from '@commander-js/extra-typings'
import { confirm, input, select } from '@inquirer/prompts'
import figlet from 'figlet'
import gradient from 'gradient-string'
import terminalImage from 'terminal-image'
import terminalLink from 'terminal-link'

// @ts-ignore
import jutgePng from '../media/jutge.png'

export const initCmd = new Command('init').description('Initialize jutge-cli').action(async () => {
    await welcome()

    const init = config.get('init', false)
    if (init) {
        print.warning('jutge-cli is already configured.')
        const reinit = await confirm({ message: 'Do you wish to reconfigure it?' })
        if (!reinit) return
    }

    print.normal("Let's configure jutge-cli.")
    const name = await input({
        message: "What's your name?",
        default: config.get('user.name', '') as string,
    })
    const email = await input({
        message: "What's your email at Jutge.org?",
        default: config.get('user.email', '') as string,
    })
    const type = await select({
        message: 'What type of user are you?',
        choices: [
            { name: 'Student', value: 'Student' },
            { name: 'Teacher', value: 'Teacher' },
            { name: 'Professional', value: 'Professional' },
            { name: 'Admin', value: 'Admin' },
        ],
        default: config.get('user.type', 'Student') as string,
    })

    config.set('init', true)
    config.set('user.name', name)
    config.set('user.email', email)
    config.set('user.type', type)

    print.success('\nThanks. Initialization successful.')
})

async function welcome() {
    const text = figlet.textSync('Jutge.org')
    console.log('')
    console.log(gradient('red', 'blue')(text))
    console.log('')
    // console.log(await terminalImage.buffer(jutgePng, { width: '50%', height: '50%' }))
    const link = terminalLink('https://jutge.org', 'https://jutge.org')
    console.log(link)
    console.log('')
}
