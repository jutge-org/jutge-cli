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

export const authAccountCmd = new Command("account").description("Manage Jutge.org accounts")

authAccountCmd.command("debug")
    .description("Debug")
    .action(async () => {
        await debugCredentials()
    })

authAccountCmd.command("add")
    .description("Register a new Jutge.org account to the CLI")
    .requiredOption("-e, --email <email>", "Account's email")
    .argument("name", "Account name")
    .action(async (name, { email }) => {
        console.log(await addAccount(name, email))
    })

authAccountCmd.command("remove")
    .description("Remove an account from the CLI")
    .argument("name", "Account name")
    .action(async (name) => {
        console.log(await removeAccount(name))
    })

authAccountCmd.command("use")
    .description("Establish a certain account as the current one")
    .argument("name", "Account name")
    .action(async (name) => {
        console.log(await setActiveAccount(name))
    })

authAccountCmd.command("list")
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
            console.log(line)
        }
    })

authAccountCmd.command("rename")
    .description("Change the name of an account")
    .argument("name", "Account name")
    .argument("newName", "New account name")
    .action(async (name, newName) => {
        console.log(await renameAccount(name, newName))
    })
