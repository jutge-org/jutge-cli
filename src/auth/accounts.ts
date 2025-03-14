import { Command } from "@commander-js/extra-typings"
import {
    addAccount,
    debugCredentials,
    getAllAccounts,
    isLoggedIn,
    removeAccount,
    renameAccount,
    setActiveAccount
} from "./credentials-file"
import { printStdout } from "../print"

export const accountCmd = new Command("accounts").description("Manage accounts in this CLI")

accountCmd.command("debug")
    .description("Debug")
    .action(async () => {
        await debugCredentials()
    })

accountCmd.command("add")
    .description("Register a new Jutge.org account to the CLI")
    .requiredOption("-e, --email <email>", "Account's email")
    .argument("name", "Account name")
    .action(async (name, { email }) => {
        printStdout(await addAccount(name, email))
    })

accountCmd.command("remove")
    .description("Remove an account from the CLI")
    .argument("name", "Account name")
    .action(async (name) => {
        printStdout(await removeAccount(name))
    })

accountCmd.command("use")
    .description("Establish a certain account as the current one")
    .argument("name", "Account name")
    .action(async (name) => {
        printStdout(await setActiveAccount(name))
    })

accountCmd.command("list")
    .description("List all the accounts")
    .action(async () => {
        const accounts = await getAllAccounts()
        const accountEntries = Object.entries(accounts)
        accountEntries.sort((a, b) => a[0].localeCompare(b[0]))
        for (const [name, account] of accountEntries) {
            const active = account.active ? "* " : "  "
            let line = `${active}${name}`
            if (account.email !== "<empty>") {
                line += ` - ${account.email}`
            }
            if (isLoggedIn(account)) {
                line += ` (logged in until ${account.expiration!.toLocaleString()})`
            }
            printStdout(line)
        }
    })

accountCmd.command("rename")
    .description("Change the name of an account")
    .argument("name", "Account name")
    .argument("newName", "New account name")
    .action(async (name, newName) => {
        printStdout(await renameAccount(name, newName))
    })
