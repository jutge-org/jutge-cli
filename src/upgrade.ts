import { Command } from '@commander-js/extra-typings'
import { execSync } from 'child_process'
import { join } from 'path'
import semver from 'semver'
import { PackageJson } from 'zod-package-json'
import { nothing, projectDir, readJson } from './utils'

export const upgradeCmd = new Command('upgrade')
    .description('Upgrade to the latest version')

    .action(async () => {
        await upgrade()
    })

export const packageJson = PackageJson.parse(await readJson(join(projectDir(), 'package.json')))

async function checkVersion(): Promise<void> {
    const currentVersion = await getCurrentVersion()
    const latestPublishedVersion = await getLatestPublishedVersion()
    if (semver.lt(currentVersion, latestPublishedVersion)) {
        console.log(
            `A new version of ${packageJson.name} is available: ${latestPublishedVersion} (you have ${packageJson.version})`,
        )
        console.log(`Please update by running: jutge upgrade`)
        console.log()
    }
}

async function getCurrentVersion(): Promise<string> {
    await nothing()
    return packageJson.version
}

async function getLatestPublishedVersion(): Promise<string> {
    const response = await fetch(`https://registry.npmjs.org/${packageJson.name}/latest`)
    const data = (await response.json()) as any
    return data.version as string
}

async function upgrade(): Promise<void> {
    const currentVersion = await getCurrentVersion()
    const latestPublishedVersion = await getLatestPublishedVersion()
    if (semver.eq(currentVersion, latestPublishedVersion)) {
        console.log(`You already have the latest version (${currentVersion})`)
    } else if (semver.gt(currentVersion, latestPublishedVersion)) {
        console.log(
            `You have a newer version (${currentVersion}) than the latest published version (${latestPublishedVersion})`,
        )
    } else {
        console.log(`Upgrading from version ${currentVersion} to ${latestPublishedVersion}`)
        execSync(`bun install --global ${packageJson.name}@latest`, { stdio: 'inherit' })
        console.log(`Successfully upgraded to version ${latestPublishedVersion}`)
    }
}
