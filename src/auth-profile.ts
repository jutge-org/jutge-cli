import { Command } from "@commander-js/extra-typings"

export const authAccountCmd = new Command("account").description("Manage Jutge.org accounts")

const authAccountNewCmd = new Command("add")
    .description("Register a new Jutge.org account to the CLI")
    .action(() => {
        console.log("auth account add")
    })

const authAccountUseCmd = new Command("use")
    .description("Establish a certain account as the current one")
    .action(() => {
        console.log("auth account use")
    })

const authAccountListCmd = new Command("list")
    .description("List all the accounts")
    .action(() => {
        console.log("auth account list")
    })

const authAccountRemoveCmd = new Command("remove")
    .description("Remove an account from the CLI")
    .action(() => {
        console.log("auth account remove")
    })

const authAccountRenameCmd = new Command("rename")
    .description("Change the name of an account")
    .action(() => {
        console.log("auth account rename")
    })

authAccountCmd.addCommand(authAccountNewCmd)
authAccountCmd.addCommand(authAccountUseCmd)
authAccountCmd.addCommand(authAccountListCmd)
authAccountCmd.addCommand(authAccountRemoveCmd)
authAccountCmd.addCommand(authAccountRenameCmd)