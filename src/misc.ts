import { Command } from "@commander-js/extra-typings"
import { jom } from "./jom"
import print from "./print"

export const miscCmd = new Command("misc").description("Miscellaneous commands")

miscCmd
    .command("time")
    .description("Display server time")
    .action(async () => {
        print.normal(await jom.misc.time())
    })

miscCmd
    .command("fortune")
    .description("Display a fortune cookie")
    .action(async () => {
        print.normal(await jom.misc.fortune())
    })

miscCmd
    .command("homestats")
    .description("Get homepage statistics​")
    .action(async () => {
        print.normal(await jom.misc.homepageStats())
    })
