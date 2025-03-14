import { Command } from "@commander-js/extra-typings"
import { accountCmd } from "./auth/accounts"
import { loginCmd, logoutCmd } from "./auth/auth"
import { loadDirectory } from "./directory/load-directory"
import { moduleCommand } from "./module-cmd"
import { versionCmd } from "./version"

export const createCli = async () => {
    const directory = await loadDirectory()
    const cli = new Command().name("jutge").description("Jutge.org CLI")
    cli.addCommand(loginCmd)
    cli.addCommand(logoutCmd)
    for (const module of directory.root.submodules) {
        cli.addCommand(moduleCommand(module, ""))
    }
    cli.addCommand(accountCmd)
    cli.addCommand(versionCmd)
    return cli
}
