import { Command } from "@commander-js/extra-typings"
import chalk from "chalk"
import { accountCmd } from "./auth/accounts"
import { loginCmd, logoutCmd } from "./auth/auth"
import { loadDirectory } from "./directory/load-directory"
import { JUTGE_API_URL } from "./env"
import { moduleCommand } from "./module-cmd"
import { versionCmd } from "./version"

export const createCli = async () => {
    try {
        const directory = await loadDirectory()
        const cli = new Command()
            .name("jutge")
            .description(`Jutge.org CLI [${chalk.blue(JUTGE_API_URL)}]`)
        cli.addCommand(loginCmd)
        cli.addCommand(logoutCmd)
        cli.addCommand(accountCmd)
        for (const module of directory.root.submodules) {
            cli.addCommand(moduleCommand(module, ""))
        }
        cli.addCommand(versionCmd)
        return cli
    } catch (e) {
        console.error(`Could not load directory.\n(Jutge API should be at: ${JUTGE_API_URL})\n`)
        process.exit(1)
    }
}
