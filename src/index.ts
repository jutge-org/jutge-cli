#!/usr/bin/env bun

import { createCli } from './cli'
import { fromError } from 'zod-validation-error'
import { packageJson } from './upgrade'
import { settings } from './settings'
import { ZodError } from 'zod'

const program = await createCli()
program.version(packageJson.version)

try {
    await program.parseAsync()
} catch (error) {
    console.log()
    console.error('An error occurred:')
    if (error instanceof Error) {
        if (error.name === 'ExitPromptError') {
            console.error('Operation cancelled by the user')
        } else if (error instanceof ZodError) {
            console.error(fromError(error).toString())
        } else {
            console.error(error.message)
            if (settings.developer) console.error(error)
        }
    } else {
        console.error(error)
    }
}
