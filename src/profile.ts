import { Command } from "@commander-js/extra-typings"

export const profileCmd = new Command("profile").description("Show profile").action(async () => {
    // const avatar = await StudentProfileService.getAvatar()
    // const buffer = await avatar.bytes()
    // console.log(await terminalImage.buffer(buffer, { width: '50%', height: '50%' }))
})
