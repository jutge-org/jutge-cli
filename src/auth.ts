import { Command } from "@commander-js/extra-typings"
import { password as pswd } from "@inquirer/prompts"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { ensure_initialized } from "./base"
import { config } from "./config"
import { jom } from "./jom"
import print from "./print"

dayjs.extend(relativeTime)

export const authCmd = new Command("auth").description("Auhentication commands")

authCmd
    .command("login")
    .description("Login to Jutge.org")
    .action(async () => {
        ensure_initialized()
        const email = config.get("user.email") as string
        const password = await pswd({
            message: `Password for ${email} at Jutge.org?`,
            mask: true,
        })
        const { success, error } = await jom.auth.login(email, password)
        if (success) {
            print.success("Login successful")
        } else {
            print.error("Login unsuccessful")
            print.error(error)
        }
    })

authCmd
    .command("logout")
    .description("Logout from Jutge.org")
    .action(async () => {
        await jom.auth.logout()
        print.success("Logout successful")
    })

authCmd
    .command("check")
    .description("Check if logged in at Jutge.org")
    .action(async () => {
        const { success, error, expiresIn } = await jom.auth.check()
        if (success) {
            print.success(`You are logged in (expiration in ${expiresIn})`)
        } else {
            print.error(error)
        }
    })
