import { Command } from '@commander-js/extra-typings'
import print from './print'
import { ensure_credentials } from './base'
import { MyProfileService } from './client'

export const profileCmd = new Command('profile').description('Show profile').action(async () => {
    ensure_credentials()
    const data = await MyProfileService.getMyProfile()
    print.verticalTable(data)
})
