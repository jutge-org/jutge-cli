import { Command, type CommandUnknownOpts, type Option } from '@commander-js/extra-typings'

// Enable debug logging by uncommenting the line below
const DEBUG = false
const _log = (msg: string) => {
    if (DEBUG) process.stderr.write(`[completions] ${msg}\n`)
}

/**
 * Check if an option expects a value (has an argument)
 */
const optionExpectsValue = (option: Option): boolean => {
    // Options with <arg> or [arg] expect values
    return option.flags.includes('<') || option.flags.includes('[')
}

/**
 * Find an option in a command by its short or long flag
 */
const findOption = (cmd: CommandUnknownOpts, flag: string): Option | undefined => {
    return cmd.options.find((opt) => opt.short === flag || opt.long === flag)
}

/**
 * Check if a command is hidden (should not appear in completions)
 */
const isHiddenCommand = (cmd: CommandUnknownOpts): boolean => {
    // Commander stores hidden state internally
    // We check if the command was added with { hidden: true }
    return (cmd as any)._hidden === true
}

/**
 * Compute available completions for the current cursor position
 */
const computeAvailableOptions = (index: number, words: string[], jutgeCmd: Command): string[] => {
    _log(`computeAvailableOptions(index=${index}, words=${JSON.stringify(words)})`)

    // Navigate to the current command based on the words before the cursor
    let currCmd: CommandUnknownOpts = jutgeCmd
    let k = 1 // Start at 1 to skip the program name ('jutge')

    while (k < index) {
        const word = words[k]
        _log(`k=${k}, cmd='${currCmd.name()}', word='${word}'`)

        if (!word) {
            _log(`Empty word at position ${k}, stopping navigation`)
            break
        }

        // Check if this word is an option
        if (word.startsWith('-')) {
            const option = findOption(currCmd, word)
            if (option && optionExpectsValue(option)) {
                // Skip the next word (the option's value)
                k += 2
                _log(`Option ${word} expects value, skipping to k=${k}`)
                continue
            }
            // Boolean option or unknown option, just skip it
            k++
            continue
        }

        // Try to find a subcommand with this name
        const foundCmd = currCmd.commands.find((c) => c.name() === word && !isHiddenCommand(c))
        if (foundCmd) {
            _log(`Found subcommand '${foundCmd.name()}'`)
            currCmd = foundCmd
            k++
            continue
        }

        // Word is not a subcommand, could be an argument - stop navigating deeper
        _log(`'${word}' is not a subcommand of '${currCmd.name()}', treating as argument`)
        k++
    }

    _log(`Finished navigation at cmd='${currCmd.name()}', k=${k}`)

    // Check if we're completing after an option that expects a value
    const prevWord = words[index - 1]
    if (prevWord && prevWord.startsWith('-')) {
        const option = findOption(currCmd, prevWord)
        if (option && optionExpectsValue(option)) {
            _log(`Previous word '${prevWord}' expects a value, no suggestions`)
            // Could provide type-specific completions here (files, etc.)
            return []
        }
    }

    // Get the current word being completed (might be partial)
    const currentWord = words[index] || ''
    _log(`Current word being completed: '${currentWord}'`)

    const result: string[] = []

    // Add matching subcommands (excluding hidden ones)
    for (const subcmd of currCmd.commands) {
        if (isHiddenCommand(subcmd)) continue
        if (subcmd.name().startsWith(currentWord)) {
            _log(`Adding subcommand: ${subcmd.name()}`)
            result.push(subcmd.name())
        }
    }

    // Add matching options (only if current word starts with '-' or is empty)
    if (currentWord === '' || currentWord.startsWith('-')) {
        // Collect already-used options to avoid suggesting them again
        const usedOptions = new Set<string>()
        for (let i = 1; i < index; i++) {
            const w = words[i]
            if (w && w.startsWith('-')) {
                usedOptions.add(w)
            }
        }

        for (const option of currCmd.options) {
            // Skip options that are already used (unless they can be repeated)
            const isUsed = (option.long && usedOptions.has(option.long)) ||
                           (option.short && usedOptions.has(option.short))

            if (option.long && option.long.startsWith(currentWord) && !isUsed) {
                _log(`Adding option: ${option.long}`)
                result.push(option.long)
            }
            if (option.short && option.short.startsWith(currentWord) && !isUsed) {
                _log(`Adding option: ${option.short}`)
                result.push(option.short)
            }
        }
    }

    _log(`Result: ${JSON.stringify(result)}`)
    return result
}

export const shellCompletionsCmd = (jutgeCmd: Command) =>
    new Command('completions')
        .description('Generate completions for shell scripts')
        .argument('<index>', 'Current cursor position (1-based)')
        .argument('<words>', 'Space-separated words in the command line')
        .helpCommand(false)
        .action((indexStr, wordsStr) => {
            // Both bash and zsh now pass 1-based index
            const index = Number(indexStr) - 1
            if (Number.isNaN(index) || index < 0) {
                _log(`Invalid index: ${indexStr}`)
                return
            }

            const words = wordsStr.split(' ')
            _log(`Parsed: index=${index}, words=${JSON.stringify(words)}`)

            const completions = computeAvailableOptions(index, words, jutgeCmd)
            completions.sort()

            // Output one completion per line
            for (const completion of completions) {
                console.log(completion)
            }
        })
