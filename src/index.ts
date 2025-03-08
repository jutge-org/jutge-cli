import { Command } from "@commander-js/extra-typings"
import { authCmd } from "./auth"
import { readCredentials } from "./credentials"
import { loadDirectory } from "./directory/load-directory"
import { moduleCommand } from "./module-cmd"
import { versionCmd } from "./version"

const directory = await loadDirectory()
await readCredentials()

const jutgeCli = new Command().name("jutge").description("Jutge.org CLI")

jutgeCli.addCommand(authCmd)
for (const module of directory.root.submodules) {
    // NOTE(pauek): We override 'auth' with a more useful alternative
    if (module.name !== "auth") {
        jutgeCli.addCommand(moduleCommand(module, ""))
    }
}
jutgeCli.addCommand(versionCmd)
jutgeCli.parse()
