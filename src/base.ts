import { config } from './config'
import print from './print'
import { OpenAPI } from './client'

export async function ensure_initialized() {
    const init = config.get('init', false)
    if (!init) {
        print.error('jutge-cli not initialized.')
        print.normal('Please run `jutge init` to start.')
        process.exit(1)
    }
}

export async function ensure_credentials() {
    ensure_initialized()
    const token = config.get('credentials.token', null) as string | null
    // TODO: Check if token is expired
    if (!token) {
        print.error('You are not logged in.')
        print.normal('Please run `jutge auth login` to log in.')
        process.exit(1)
    }
    OpenAPI.TOKEN = token
}
