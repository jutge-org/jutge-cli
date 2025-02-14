import { Command } from "@commander-js/extra-typings"
import { version } from "../package.json"
import { loadDirectory } from "./directory/load-directory"
import { moduleCommand } from "./module-cmd"
import { versionCmd } from "./version"
import { readCredentials } from "./credentials"

const directory = await loadDirectory()
await readCredentials()

const jutgeCli = new Command()
    .name("jutge")
    .description("Jutge.org CLI")
    .version(version, "--version", "Show the Jutge.org/cli version")

jutgeCli.addCommand(versionCmd)
for (const module of directory.root.submodules) {
    jutgeCli.addCommand(moduleCommand(module, ""))
}
jutgeCli.parse()
