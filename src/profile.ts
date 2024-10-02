import { Command } from '@commander-js/extra-typings'
import { ensure_credentials } from './base'
import { UserProfileService } from './client'
import print from './print'

export const profileCmd = new Command('profile').description('Show profile').action(async () => {
    ensure_credentials()
    const data = await UserProfileService.getProfile()
    print.verticalTable(data)
    const avatar = await UserProfileService.getAvatar()
    // TODO:   console.log(await terminalImage.buffer(avatar, { width: '50%', height: '50%' }))
})
