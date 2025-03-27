import { input, password as inputPassword } from "@inquirer/prompts"
import { Static, Type } from "@sinclair/typebox"
import { Value } from "@sinclair/typebox/value"
import chalk from "chalk"
import { existsSync } from "fs"
import { mkdir, readFile, writeFile } from "fs/promises"
import { jutgeApiCall, setAPIToken } from "../jutge-api-call"
import { OutputFormat } from "../module-cmd"
import { printStdout } from "../print"

const formatNames = ["json", "yaml", "csv", "table", "raw"]

const TFormat = Type.Union([
    Type.Literal("json"),
    Type.Literal("yaml"),
    Type.Literal("csv"),
    Type.Literal("table"),
    Type.Literal("raw"),
])
type Format = Static<typeof TFormat>

const TCredentials = Type.Object({
    user_uid: Type.String(),
    email: Type.String(),
    token: Type.String(),
    expiration: Type.Optional(Type.Date()),
    active: Type.Optional(Type.Boolean()),
    defaultFormat: Type.Optional(TFormat),
    savedPassword: Type.Optional(Type.String()),
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
        _activateAccount(accounts, DEFAULT_ACCOUNT_NAME)
        return true
    }
    return false
}

const _readCredentials = async (): Promise<CredentialsData> => {
    if (!existsSync(CREDENTIALS_FILENAME)) {
        return INITIAL_CREDENTIALS_DATA
    }
    const bytes = await readFile(CREDENTIALS_FILENAME)
    const data = JSON.parse(bytes.toString())
    try {
        const credentialsData = Value.Parse(TCredentialsData, data)
        if (_ensureOneActiveAccount(credentialsData)) {
            await _saveCredentials(credentialsData)
        }
        return credentialsData
    } catch (e) {
        // If the file is corrupted, reset it to the default
        printStdout(
            chalk.redBright(`Warning: error parsing credentials file, resetting to default`),
        )
        await _saveCredentials(INITIAL_CREDENTIALS_DATA)
        return INITIAL_CREDENTIALS_DATA
    }
}

const _saveCredentials = async (data: CredentialsData) => {
    await mkdir(STATE_DIR, { recursive: true })
    await writeFile(CREDENTIALS_FILENAME, JSON.stringify(data, null, 2))
}

const withPersistentAccounts = async <T>(fn: (accounts: CredentialsData) => Promise<T>) => {
    const accounts = await _readCredentials()
    const result = await fn(accounts)
    await _saveCredentials(accounts)
    return result
}

export const _getActiveAccountName = (accounts: CredentialsData): string => {
    const name = Object.keys(accounts).find((name) => accounts[name].active)
    if (!name) {
        throw new Error(`No active account!`)
    }
    return name
}

export const setActiveAccount = async (name: string): Promise<string | undefined> => {
    return await withPersistentAccounts(async (accounts) => {
        if (!(name in accounts)) {
            return `Account ${name} does not exist`
        }
        _activateAccount(accounts, name)
        return `Active account is now '${name}'`
    })
}

export const addAccount = async (name: string, email: string): Promise<string> => {
    return await withPersistentAccounts(async (accounts) => {
        if (name in accounts) {
            return `Account '${name}' already exists`
        }
        accounts[name] = {
            email,
            user_uid: "<unknown>",
            token: "<empty>",
        }
        return `Account '${name}' added`
    })
}

export const removeAccount = async (name: string): Promise<string> => {
    if (name === DEFAULT_ACCOUNT_NAME) {
        return `Cannot remove the '${DEFAULT_ACCOUNT_NAME}' account`
    }
    return await withPersistentAccounts(async (accounts) => {
        if (!(name in accounts)) {
            return `Account '${name}' does not exist`
        }
        delete accounts[name]
        _ensureOneActiveAccount(accounts)
        return `Account '${name}' removed`
    })
}

export const renameAccount = async (name: string, newName: string): Promise<string> => {
    return await withPersistentAccounts(async (accounts) => {
        if (!(name in accounts)) {
            return `Account ${name} does not exist`
        }
        if (name === DEFAULT_ACCOUNT_NAME) {
            return `Cannot rename the '${DEFAULT_ACCOUNT_NAME}' account`
        }
        accounts[newName] = accounts[name]
        delete accounts[name]
        return `Account '${name}' renamed to '${newName}'`
    })
}

export const getAllAccounts = async (): Promise<Record<string, Credentials>> => {
    return await _readCredentials()
}

const getAndSaveEmail = async (accountName: string, account: Credentials, email?: string) => {
    if (account.email === "<empty>") {
        // Prompt for email if we don't have it
        account.email = email || (await input({ message: "email:" }))
    } else if (email && account.email !== email) {
        printStdout(
            chalk.yellowBright(`Warning: changing email from '${account.email}' to '${email}'.`),
        )
        account.email = email
    } else if (email && account.email === email) {
        printStdout(
            chalk.yellowBright(
                `Note: email for account ${accountName} is already '${email}', you can omit it.`,
            ),
        )
    }
    return account.email
}

const getSavedPassword = (account: Credentials) => {
    const rawSavedPassword = account.savedPassword
    if (rawSavedPassword === undefined) {
        return undefined
    }
    return Buffer.from(rawSavedPassword, "base64").toString()
}

export const getPassword = async (account: Credentials, _password?: string): Promise<string> => {
    const savedPassword = getSavedPassword(account)
    if (_password) {
        if (savedPassword) {
            printStdout(
                chalk.yellowBright(
                    `Warning: password provided as argument, ignoring saved password.`,
                ),
            )
        }
        return _password
    } else if (savedPassword) {
        return savedPassword
    }
    const typedPassword = await inputPassword({ message: "password:" })
    return typedPassword
}

type LoginCallResult = {
    token: string
    user_uid: string
    expiration: Date
    error?: string
}
export const loginCall = async (email: string, password: string): Promise<LoginCallResult> => {
    const [result] = await jutgeApiCall("auth.login", { email, password })
    return result
}

const setToken = (account: Credentials, result: LoginCallResult) => {
    account.token = result.token
    account.user_uid = result.user_uid
    account.expiration = result.expiration
}

export const login = async (
    accountName: string | undefined,
    _email?: string,
    _password?: string,
): Promise<string> => {
    const accounts = await _readCredentials()

    if (accountName === undefined) {
        accountName = _getActiveAccountName(accounts)
    } else if (accounts[accountName] === undefined) {
        return `Account '${accountName}' does not exist`
    }

    const account = accounts[accountName]
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
        printStdout(`Logging in for account '${accountName}' (${_email || account.email}):`)

        const email = await getAndSaveEmail(accountName, account, _email)
        const password = await getPassword(account, _password)

        const result = await loginCall(email, password)
        if (result.error) {
            return `Error logging in: ${result.error}`
        }

        setToken(account, result)
        await _saveCredentials(accounts)

        return `Logged in as '${account.email}' ('${accountName}' account).`
    } catch (e) {
        if (e.name === "ExitPromptError") {
            return `interrupted`
        }
        throw e
    }
}

export const logout = async (accountName: string | undefined) => {
    return await withPersistentAccounts(async (accounts) => {
        if (accountName === undefined) {
            accountName = _getActiveAccountName(accounts)
        } else if (accounts[accountName] === undefined) {
            return `Account '${accountName}' does not exist`
        }

        const account = accounts[accountName]
        if (account.token === "<empty>") {
            return `Already logged out of '${accountName}' (${account.email})`
        }
        account.token = "<empty>"
        delete account.expiration

        return `Logged out of '${accountName}' (${account.email})`
    })
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

export const tryAutoLoginWithSavedPassword = async (account: Credentials) => {
    const email = account.email
    if (email === "<empty>") {
        return null
    }
    const savedPassword = getSavedPassword(account)
    if (savedPassword === undefined) {
        return null
    }
    try {
        console.log(chalk.grey(`Logging in with saved password...`))
        const result = await loginCall(email, savedPassword)
        if (result.error) {
            printStdout(chalk.redBright(`Error logging in with savedPassword: ${result.error}`))
        }
        setToken(account, result)
        return result.token
    } catch (e) {
        return null
    }
}

export const applyCredentials = async (accountName?: string | undefined) => {
    return await withPersistentAccounts(async (accounts) => {
        if (accountName === undefined) {
            accountName = _getActiveAccountName(accounts)
        }
        const account = accounts[accountName]
        if (account === undefined) {
            printStdout(chalk.redBright(`Warning: account '${accountName}' does not exist`))
            return
        }
        if (account.token && account.token !== "<empty>") {
            const now = new Date()
            if (account.expiration && account.expiration > now) {
                setAPIToken(account.token)
                return
            }
            printStdout(chalk.grey(`Token has expired`))
        }
        const token = await tryAutoLoginWithSavedPassword(account)
        if (token !== null) {
            setAPIToken(token)
        }
    })
}

export const changeDefaultFormat = async (format: string, accountName?: string) => {
    return await withPersistentAccounts(async (accounts) => {
        if (accountName === undefined) {
            accountName = _getActiveAccountName(accounts)
        }
        const account = accounts[accountName]
        if (account === undefined) {
            return chalk.redBright(`Warning: account '${accountName}' does not exist`)
        }
        if (!formatNames.includes(format)) {
            return `Unknown format '${format}'`
        }
        account.defaultFormat = format as Format
        return `Default format for account \`${accountName}\` is now "${format}"`
    })
}

export const getDefaultFormat = async (): Promise<OutputFormat> => {
    const credentials = await _readCredentials()
    const accountName = _getActiveAccountName(credentials)
    const account = credentials[accountName]
    if (account === undefined) {
        return null
    }
    return account.defaultFormat || null
}

export const saveAccountPassword = async (accountName: string | undefined) => {
    return await withPersistentAccounts(async (accounts) => {
        if (accountName === undefined) {
            accountName = _getActiveAccountName(accounts)
        }
        const account = accounts[accountName]
        if (account === undefined) {
            return `Account '${accountName}' does not exist`
        }
        console.log(
            chalk.yellow(
                `WARNING: The password you type will be stored in plain text in the credentials file.`,
            ),
        )
        console.log(`Saving password for account '${accountName}' (${account.email}):`)
        const password = await inputPassword({ message: "password:" })
        account.savedPassword = Buffer.from(password).toString("base64")
        return `Password saved.`
    })
}
