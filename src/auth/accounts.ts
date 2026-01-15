import { Command } from '@commander-js/extra-typings'
import { printStdout } from '../print'
import { accountsManualText } from './accounts-manual'
import {
    addAccount,
    changeDefaultFormat,
    getAllAccounts,
    isLoggedIn,
    removeAccount,
    renameAccount,
    saveAccountPassword,
    setActiveAccount,
} from './credentials-file'

export const accountCmd = new Command('accounts').description('Manage accounts in this CLI')

accountCmd
    .command('list')
    .description('List all the accounts')
    .action(async () => {
        const accounts = await getAllAccounts()
        const accountEntries = Object.entries(accounts)
        accountEntries.sort((a, b) => a[0].localeCompare(b[0]))
        for (const [name, account] of accountEntries) {
            const active = account.active ? '* ' : '  '
            let line = `${active}${name}`
            if (account.email !== '<empty>') {
                line += ` - ${account.email}`
            }
            if (isLoggedIn(account)) {
                line += ` (logged in until ${account.expiration!.toLocaleString()})`
            }
            printStdout(line)
        }
    })

accountCmd
    .command('use')
    .description('Establish a certain account as the current one')
    .argument('name', 'Account name')
    .action(async (name) => {
        printStdout(await setActiveAccount(name))
    })

accountCmd
    .command('add')
    .description('Register a new Jutge.org account to the CLI')
    .requiredOption('-e, --email <email>', "Account's email")
    .argument('name', 'Account name')
    .action(async (name, { email }) => {
        printStdout(await addAccount(name, email))
    })

accountCmd
    .command('remove')
    .description('Remove an account from the CLI')
    .argument('name', 'Account name')
    .action(async (name) => {
        printStdout(await removeAccount(name))
    })

accountCmd
    .command('rename')
    .description('Change the name of an account')
    .argument('name', 'Account name')
    .argument('newName', 'New account name')
    .action(async (name, newName) => {
        printStdout(await renameAccount(name, newName))
    })

accountCmd
    .command('default-format')
    .description('Set the default output format for an account')
    .option('-a, --account <account>', 'Account for which to change format (default: active account)')
    .argument('format', 'Output format (json, table, yaml, csv, or raw)')
    .action(async (format, { account }) => {
        printStdout(await changeDefaultFormat(format, account))
    })

accountCmd
    .command('save-password')
    .description(
        `Save the password locally for an account.
WARNING: the password will be stored and NOT securely encrypted.`,
    )
    .option('-a, --account <account>', 'Account for which to change format (default: active account)')
    .action(async ({ account }) => {
        printStdout(await saveAccountPassword(account))
    })

accountCmd
    .command('manual')
    .description('Show the manual for the CLI accounts.')
    .action(() => {
        const lines = accountsManualText.split('\n')
        // Wrap long lines to at most 70 characters
        for (let line of lines) {
            while (line.length > 70) {
                const lastSpace = line.lastIndexOf(' ', Math.min(process.stdout.columns, 70))
                if (lastSpace === -1) {
                    break
                }
                printStdout(line.slice(0, lastSpace))
                line = line.slice(lastSpace + 1)
            }
            printStdout(line)
        }
    })
