import { Command } from "@commander-js/extra-typings"
import { ensure_credentials } from "./base"

export const profileCmd = new Command("profile").description("Show profile").action(async () => {
    ensure_credentials()
    // const avatar = await StudentProfileService.getAvatar()
    // const buffer = await avatar.bytes()
    // console.log(await terminalImage.buffer(buffer, { width: '50%', height: '50%' }))
})
