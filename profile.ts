import { Command } from '@commander-js/extra-typings'
import print from './print'
import { ensure_credentials } from './base'
import { MyProfileService } from './client'
import terminalImage from 'terminal-image'

export const profileCmd = new Command('profile').description('Show profile').action(async () => {
    ensure_credentials()
    const data = await MyProfileService.getProfile()
    print.verticalTable(data)
    const avatar = await MyProfileService.getAvatar()
    // TODO:   console.log(await terminalImage.buffer(avatar, { width: '50%', height: '50%' }))
})
