import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import { existsSync } from "fs"
import { readFile, rm, writeFile } from "fs/promises"
import { jutgeApiCall } from "./jutge-api-call"
import { mkdir } from "fs/promises"

export const TCredentials = Type.Object({
    token: Type.String(),
    expiration: Type.Date(),
    user_uid: Type.String(),
})
type Credentials = Static<typeof TCredentials>

const stateDir = `${process.env.HOME}/.local/state/jutge.org`
const credentialsFile = `${stateDir}/credentials.json`

export const saveCredentials = async (data: any) => {
    const credentials = Value.Parse(TCredentials, data)
    await mkdir(stateDir, { recursive: true })
    await writeFile(credentialsFile, JSON.stringify(credentials))
    console.log("Logged in")
}

export const removeCredentials = async () => {
    if (existsSync(credentialsFile)) {
        await rm(credentialsFile)
        console.log("Logged out")
    }
}

export const readCredentials = async () => {
    if (existsSync(credentialsFile)) {
        const bytes = await readFile(credentialsFile)
        const credentials = JSON.parse(bytes.toString()) as Credentials
        jutgeApiCall.meta = {
            token: credentials.token,
        }
    }
}
