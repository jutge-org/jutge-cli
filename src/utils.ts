import { execa } from 'execa'
import { exists, readFile, stat, writeFile } from 'fs/promises'
import { basename, dirname, join, normalize } from 'path'
import { fileURLToPath } from 'url'
import YAML from 'yaml'

export async function nothing(): Promise<void> {
    // Do nothing: just a way to ignore lint warnings
}

export async function existsInDir(directory: string, path: string): Promise<boolean> {
    return await exists(join(directory, path))
}

export async function readText(path: string): Promise<string> {
    const content = await readFile(path, 'utf8')
    return content
}

export async function readTextInDir(directory: string, path: string): Promise<string> {
    return await readFile(join(directory, path), 'utf8')
}

export async function readBytes(path: string): Promise<Uint8Array> {
    const content = await readFile(path)
    return content
}

export async function readBytesInDir(directory: string, path: string): Promise<Uint8Array> {
    return await readBytes(join(directory, path))
}

export async function readYaml(path: string): Promise<any> {
    const content = await readText(path)
    return YAML.parse(content)
}

export async function readYamlInDir(directory: string, path: string): Promise<any> {
    return await readYaml(join(directory, path))
}

export async function readJson(path: string): Promise<any> {
    const content = await readText(path)
    return JSON.parse(content)
}

export async function readJsonInDir(directory: string, path: string): Promise<any> {
    return await readJson(join(directory, path))
}

export async function writeText(path: string, content: string): Promise<void> {
    await writeFile(path, content)
}

export async function writeTextInDir(directory: string, path: string, content: string): Promise<void> {
    await writeText(join(directory, path), content)
}

export async function writeYaml(path: string, data: any): Promise<void> {
    const content = YAML.stringify(data, null, 4)
    await writeText(path, content)
}

export async function writeYamlInDir(directory: string, path: string, data: any): Promise<void> {
    await writeYaml(join(directory, path), data)
}

export async function writeJson(path: string, data: any): Promise<void> {
    const content = JSON.stringify(data, null, 4)
    await writeText(path, content)
}

export async function writeJsonInDir(directory: string, path: string, data: any): Promise<void> {
    await writeJson(join(directory, path), data)
}

export async function fileSize(path: string): Promise<number> {
    const stats = await stat(path)
    return stats.size
}

export async function fileSizeInDir(directory: string, path: string): Promise<number> {
    return await fileSize(join(directory, path))
}

export async function filesAreEqual(path1: string, path2: string): Promise<boolean> {
    const bytes1 = await readBytes(path1)
    const bytes2 = await readBytes(path2)
    return bytes1.length === bytes2.length && bytes1.every((b, i) => b === bytes2[i])
}

export async function filesAreEqualInDir(directory: string, path1: string, path2: string): Promise<boolean> {
    return await filesAreEqual(join(directory, path1), join(directory, path2))
}

export async function isDirectory(path: string): Promise<boolean> {
    try {
        const stats = await stat(path)
        return stats.isDirectory()
    } catch (e) {
        return false
    }
}

export async function isDirectoryInDir(directory: string, path: string): Promise<boolean> {
    return await isDirectory(join(directory, path))
}

// Guess user name from git config
export async function guessUserName(): Promise<string | null> {
    try {
        const { stdout } = await execa`git config user.name`
        const name = stdout.trim()
        if (name === '') return null
        return name
    } catch (e) {
        return null
    }
}

// Guess user email from git config
export async function guessUserEmail(): Promise<string | null> {
    try {
        const { stdout } = await execa`git config user.email`
        const email = stdout.trim()
        if (email === '') return null
        return email
    } catch (e) {
        return null
    }
}

export function projectDir(): string {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    return normalize(join(__dirname, '..'))
}

export function toolkitPrefix(): string {
    return 'jtk'
}

export async function createFileFromPath(path: string, type: string): Promise<File> {
    const buffer = await readFile(path)
    const filename = basename(path)
    const file = new File([buffer], filename, { type })
    return file
}

// Utility function to strip LaTeX commands from text
// Simplistic implementation; may need to be improved for complex LaTeX but works for basic cases and our needs
export function stripLaTeX(text: string): string {
    return text
        .replace(/\\[a-zA-Z]+\{([^}]*)\}/g, '$1') // Remove commands like \textbf{text}
        .replace(/\$\$([^$]+)\$\$/g, '$1') // Remove display math $$...$$
        .replace(/\$([^$]+)\$/g, '$1') // Remove inline math $...$
        .replace(/\\[a-zA-Z]+/g, '') // Remove other commands
        .replace(/[{}]/g, '') // Remove remaining braces
}

export function convertStringToItsType(value: string): string | number | boolean {
    // Try parsing as boolean
    const lower = value.toLowerCase()
    if (lower === 'true') return true
    if (lower === 'false') return false

    // Try parsing as number
    if (!isNaN(Number(value)) && value.trim() !== '') {
        return Number(value)
    }

    // Return as string
    return value
}

export const isObject = (x: any) => x && typeof x === 'object' && !Array.isArray(x)

export const isEmptyObject = (x: any) => isObject(x) && Object.keys(x).length === 0
