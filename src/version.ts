import { Command } from "@commander-js/extra-typings"
import { version } from "../package.json"

export const versionCmd = new Command("version")
    .description("Show the Jutge.org/cli version")
    .action(() => {
        console.log(version)
    })
