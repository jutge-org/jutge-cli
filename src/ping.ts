import { Command } from "@commander-js/extra-typings"
import { jom } from "./jom"
import print from "./print"

export const pingCmd = new Command("ping").description("Ping command").action(async (str) => {
    print.normal(await jom.misc.ping())
})
