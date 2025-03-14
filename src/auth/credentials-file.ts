import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import { existsSync } from "fs"
import { mkdir, readFile, writeFile } from "fs/promises"
import { jutgeApiCall } from "../jutge-api-call"
import { password as inputPassword, input } from "@inquirer/prompts"
import { printStdout } from "../print"
import chalk from "chalk"

const TCredentials = Type.Object({
    user_uid: Type.String(),
    email: Type.String(),
    token: Type.String(),
    expiration: Type.Optional(Type.Date()),
    active: Type.Optional(Type.Boolean()),
})
type Credentials = Static<typeof TCredentials>

const TCredentialsData = Type.Record(Type.String(), TCredentials)

type CredentialsData = Static<typeof TCredentialsData>

const STATE_DIR = `${process.env.HOME}/.local/state/jutge.org`
const CREDENTIALS_FILENAME = `${STATE_DIR}/credentials.json`
const DEFAULT_ACCOUNT_NAME = "default"

const DEFAULT_ACCOUNT_DATA = {
    email: "<empty>",
    user_uid: "<empty>",
    token: "<empty>",
    active: true,
}

const INITIAL_CREDENTIALS_DATA: CredentialsData = {
    [DEFAULT_ACCOUNT_NAME]: DEFAULT_ACCOUNT_DATA,
}

export const isDefaultAccount = (name: string) => name === DEFAULT_ACCOUNT_NAME

const _activateAccount = (accounts: CredentialsData, activeAccountName: string) => {
    if (Object.keys(accounts).length === 0) {
        accounts[DEFAULT_ACCOUNT_NAME] = DEFAULT_ACCOUNT_DATA
        return
    }
    // Ensure only the active account is really active
    for (const name in accounts) {
        if (name === activeAccountName) {
            accounts[name].active = true
            continue
        }
        delete accounts[name].active
    }
}

const _ensureOneActiveAccount = (accounts: CredentialsData) => {
    // Find out which account is the first active
    let activeAccount = ""
    for (let [name, account] of Object.entries(accounts)) {
        if (account.active) {
            activeAccount = name
            break
        }
    }
    // If there is no active account, set the default to active
    if (activeAccount === "") {
        activeAccount = DEFAULT_ACCOUNT_NAME
    }
    _activateAccount(accounts, activeAccount)
}

const _readFile = async (): Promise<CredentialsData> => {
    if (!existsSync(CREDENTIALS_FILENAME)) {
        return INITIAL_CREDENTIALS_DATA
    }
    const bytes = await readFile(CREDENTIALS_FILENAME)
    const data = JSON.parse(bytes.toString())
    try {
        const credentialsData = Value.Parse(TCredentialsData, data)
        _ensureOneActiveAccount(credentialsData)
        await _saveFile(credentialsData)
        return credentialsData
    } catch (e) {
        // If the file is corrupted, reset it to the default
        printStdout(chalk.redBright(`Warning: error parsing credentials file, resetting to default`))
        await _saveFile(INITIAL_CREDENTIALS_DATA)
        return INITIAL_CREDENTIALS_DATA
    }
}

const _saveFile = async (data: CredentialsData) => {
    // const credentialsData = Value.Parse(TCredentialsData, data)
    await mkdir(STATE_DIR, { recursive: true })
    await writeFile(CREDENTIALS_FILENAME, JSON.stringify(data, null, 2))
}

export const _getActiveAccount = async (
    accounts: CredentialsData,
): Promise<[string, Credentials]> => {
    const name = Object.keys(accounts).find((name) => accounts[name].active)
    if (!name) {
        throw new Error(`No active account!`)
    }
    return [name, accounts[name]]
}

export const getActiveAccountName = async (): Promise<string> => {
    const [name] = await _getActiveAccount(await _readFile())
    return name
}

export const setActiveAccount = async (name: string): Promise<string> => {
    const accounts = await _readFile()
    if (!(name in accounts)) {
        return `Account ${name} does not exist`
    }
    _activateAccount(accounts, name)
    await _saveFile(accounts)
    return `Active account is now '${name}'`
}

export const addAccount = async (name: string, email: string): Promise<string> => {
    let accounts = await _readFile()
    if (name in accounts) {
        return `Account '${name}' already exists`
    }
    accounts[name] = {
        email,
        user_uid: "<unknown>",
        token: "<empty>",
    }
    await _saveFile(accounts)
    return `Account '${name}' added`
}

export const removeAccount = async (name: string): Promise<string> => {
    if (name === DEFAULT_ACCOUNT_NAME) {
        return `Cannot remove the '${DEFAULT_ACCOUNT_NAME}' account`
    }
    const accounts = await _readFile()
    if (!(name in accounts)) {
        return `Account '${name}' does not exist`
    }
    delete accounts[name]
    _ensureOneActiveAccount(accounts)
    await _saveFile(accounts)
    return `Account '${name}' removed`
}

export const renameAccount = async (name: string, newName: string): Promise<string> => {
    const accounts = await _readFile()
    if (!(name in accounts)) {
        return `Account ${name} does not exist`
    }
    if (name === DEFAULT_ACCOUNT_NAME) {
        return `Cannot rename the '${DEFAULT_ACCOUNT_NAME}' account`
    }
    accounts[newName] = accounts[name]
    delete accounts[name]
    await _saveFile(accounts)
    return `Account '${name}' renamed to '${newName}'`
}

export const getAllAccounts = async (): Promise<Record<string, Credentials>> => {
    return await _readFile()
}

export const login = async (
    accountName: string,
    _email?: string,
    _password?: string,
): Promise<string> => {
    const accounts = await _readFile()
    const account = accounts[accountName]
    if (account === undefined) {
        throw new Error(`Account '${accountName}' should exist!`)
    }
    if (account.token !== "<empty>") {
        if (account.expiration === undefined) {
            throw new Error(`ERROR: Token present but no expiration time.`)
        }
        // Check expiration
        const now = new Date()
        if (account.expiration > now) {
            return `Already logged in ('${accountName}' account).`
        }
    }

    try {
        printStdout(`Logging in for account '${accountName}': (${_email || account.email})`)

        if (account.email === "<empty>") {
            // Prompt for email if we don't have it
            account.email = _email || (await input({ message: "email:" }))
        } else if (_email && account.email !== _email) {
            printStdout(
                chalk.yellowBright(`Warning: changing email from '${account.email}' to '${_email}'.`),
            )
            account.email = _email
        } else if (_email && account.email === _email) {
            printStdout(
                chalk.yellowBright(
                    `Note: email for account ${accountName} is already '${_email}', you can omit it.`,
                ),
            )
        }

        const password = _password || (await inputPassword({ message: "password:" }))
        const [result] = await jutgeApiCall("auth.login", {
            email: account.email,
            password,
        })
        if (result.error) {
            return `Error logging in: ${result.error}`
        }

        account.token = result.token
        account.user_uid = result.user_uid
        account.expiration = result.expiration

        await _saveFile(accounts)

        return `Logged in as '${account.email}' ('${accountName}' account).`
    } catch (e) {
        if (e.name === "ExitPromptError") {
            return `interrupted`
        }
        throw e
    }
}

export const logout = async (accountName: string) => {
    const accounts = await _readFile()
    const account = accounts[accountName]
    if (account === undefined) {
        throw new Error(`Account '${accountName}' should exist!`)
    }

    account.token = "<empty>"
    delete account.expiration

    await _saveFile(accounts)
    return `Logged out of '${accountName}' (${account.email})`
}

export const debugCredentials = async () => {
    const data = await _readFile()
    printStdout(data)
}

export const isLoggedIn = (account: Credentials) => {
    if (account.token === "<empty>") {
        return false
    }
    if (account.expiration === undefined) {
        throw new Error(`Expiration should be defined`)
    }
    return account.expiration > new Date()
}

export const applyCredentials = async (accountName?: string | undefined) => {
    const accounts = await _readFile()
    if (accountName === undefined) {
        accountName = await getActiveAccountName()
    }
    const account = accounts[accountName]
    if (account === undefined) {
        printStdout(chalk.redBright(`Warning: account '${accountName}' does not exist`))
        return
    }
    if (account.token !== "<empty>") {
        jutgeApiCall.meta = { token: account.token }
    }
}
