import { Command } from '@commander-js/extra-typings'
import terminalImage from 'terminal-image'
import terminalLink from 'terminal-link'
import gradient from 'gradient-string'
import figlet from 'figlet'

// @ts-ignore
import jutgePng from './jutge.png'

export const helloCmd = new Command('hello').description('Hello Jutge.org').action(async () => {
    const text = figlet.textSync('Jutge.org')
    console.log('')
    console.log(gradient('red', 'blue')(text))
    console.log('')
    console.log(await terminalImage.buffer(jutgePng, { width: '50%', height: '50%' }))
    const link = terminalLink('https://jutge.org', 'https://jutge.org')
    console.log(link)
    console.log('')
})
