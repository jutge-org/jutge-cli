import { Command } from '@commander-js/extra-typings'
import { ensure_credentials } from './base'
import { StudentProfileService } from './client'
import print from './print'

export const profileCmd = new Command('profile').description('Show profile').action(async () => {
    ensure_credentials()
    const data = await StudentProfileService.getProfile()
    print.verticalTable(data)
    const avatar = await StudentProfileService.getAvatar()
    // TODO:   console.log(await terminalImage.buffer(avatar, { width: '50%', height: '50%' }))
})
