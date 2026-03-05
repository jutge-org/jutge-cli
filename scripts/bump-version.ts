import { readFileSync, writeFileSync } from 'fs'
import semver from 'semver'

const args = process.argv.slice(2)
const release = args[0] ?? 'patch'

if (!['major', 'minor', 'patch'].includes(release)) {
    console.error(`Usage: bun run bump-version [major|minor|patch]`)
    console.error(`  Default: patch`)
    process.exit(1)
}

const packageJsonPath = new URL('../package.json', import.meta.url).pathname
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
const currentVersion = packageJson.version
const newVersion = semver.inc(currentVersion, release as semver.ReleaseType)

if (!newVersion) {
    console.error(`Failed to bump version from ${currentVersion}`)
    process.exit(1)
}

packageJson.version = newVersion
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4) + '\n')

console.log(`${currentVersion} -> ${newVersion}`)
