import { config } from './config'
import print from './print'

export async function ensure_initialized() {
    const init = config.get('init', false)
    if (!init) {
        print.error(`@jutge.org/cli hasn't been initialized yet.`)
        print.normal('Please run `jutge init` to start.')
        process.exit(1)
    }
}
