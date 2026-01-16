import { Command, type CommandUnknownOpts } from '@commander-js/extra-typings'

const _log = (msg: string) => {
    // process.stderr.write(`${msg}\n`)
}

const computeAvailableOptions = (index: number, words: string[], jutgeCmd: Command): string[] => {
    _log(`computeAvailableOptions(${index}, ${JSON.stringify(words)})`)
    // First locate the command we are at
    let currCmd: CommandUnknownOpts = jutgeCmd
    let k = 1
    while (k < index) {
        const word = words[k]
        _log(`k is ${k}, at command '${currCmd.name()}', word is '${word}'`)
        if (!word) {
            _log(`word is ${word}, exiting loop.`)
            break
        }
        const foundCmd = currCmd.commands.find((c) => c.name() === word)
        if (!foundCmd) {
            _log(`   Didn't find ${word} in ${currCmd.commands.map((c) => c.name()).join(', ')}`)
            return []
        }

        k++
        currCmd = foundCmd
    }
    _log(`Finished loop, cmd is ${currCmd.name()}, k is ${k}`)
    // lookup the next word
    const word = words[index] || ''
    _log(`word = '${word}'`)
    const result: string[] = []
    for (const subcmd of currCmd.commands) {
        _log(`Considering '${subcmd.name()}'`)
        if (subcmd.name().startsWith(word)) {
            _log(`  Added ${subcmd.name()}`)
            result.push(subcmd.name())
        }
    }
    for (const option of currCmd.options) {
        if (option.long) {
            _log(`Considering '${option.long}'`)
            if (option.long.startsWith(word)) {
                result.push(option.long)
            }
        }
        if (option.short) {
            _log(`Considering '${option.short}'`)
            if (option.short.startsWith(word)) {
                result.push(option.short)
            }
        }
    }
    _log(`Result is ${JSON.stringify(result)}`)
    return result
}

export const shellCompletionsCmd = (jutgeCmd: Command) =>
    new Command('completions')
        .description('Generate completions for Bash and Zsh')
        .argument('i')
        .argument('args')
        .helpCommand(false)
        .action((i, args) => {
            const index = Number(i) - 1 // NOTE(pauek): in bash, indices are 1 based!
            if (Number.isNaN(index)) {
                return
            }
            const words = args.split(' ')

            const options: string[] = computeAvailableOptions(index, words, jutgeCmd)
            options.sort()
            console.log(options.map((o) => `${o}\n`).join(''))
        })
