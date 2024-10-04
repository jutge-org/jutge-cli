import { Command } from '@commander-js/extra-typings'
import axios from 'axios'
import { sleep } from 'bun'
import ora from 'ora'
import path from 'path'
import sound from 'sound-play'
import terminalLink from 'terminal-link'
import print from './print'

// TODO: use client rather than axios, but I do not know how to do upload files with it.

// TODO: fix
// import successMp3 from '@/media/success.mp3'
// import failureMp3 from '@/media/failure.mp3'

export const submitCmd = new Command('submit')
    .description('Submit a solution to a problem')
    .argument('<problem>', 'Problem ID')
    .argument('<file>', 'File to submit')
    .requiredOption('-c, --compiler <compiler>', 'Compiler to use', 'auto')
    .option('-a, --annotation <annotation>', 'Annotation for the submission')
    .option('-s, --silent', 'Do not play sound after verdict')
    .option('-n, --no-wait', 'Do not wait for verdict')
    .action(async (problem, file, options) => {
        try {
            const problem_nm = problem.split('_')[0]
            const problem_id = problem

            if (options.compiler === 'auto') {
                options.compiler = guessCompiler(path.extname(file))
                print.normal(`Auto compiler: ${options.compiler}`)
            }

            // TODO: check file exists
            // TODO: check compiler exists
            // TODO: check problem is available
            // TODO: ...

            const form = new FormData()
            form.append('compiler_id', options.compiler)
            form.append('annotation', options.annotation || '')
            form.append('file', Bun.file(file))

            const response = await axios.post(
                `/my/submissions/${problem_nm}/${problem_id}/submit`,
                form,
            )

            const submission_id = response.data.submission_id
            const submissionLink = terminalLink(
                submission_id,
                `https://jutge.org/problems/${problem_id}/submissions/${submission_id}`,
            )
            const problemLink = terminalLink(problem_id, `https://jutge.org/problems/${problem_id}`)
            print.success(`Submission ${submissionLink} for ${problemLink}`)

            if (options.wait) {
                const spinner = ora({
                    text: 'Waiting for the verdict',
                    color: 'green',
                    spinner: 'dots', // https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json
                })
                spinner.start()
                while (true) {
                    await sleep(1000)
                    const response = await axios.get(
                        `/my/submissions/${problem_nm}/${problem_id}/${submission_id}`,
                    )
                    const verdict = response.data.veredict
                    if (verdict !== 'Pending') {
                        spinner.stop()
                        if (!options.silent) {
                            sound.play(`media/${audio(verdict)}.mp3`)
                        }
                        print.normal(`Verdict: ${sign(verdict)}${verdict}`)
                        break
                    }
                }
            }
        } catch (error: any) {
            console.error(error.message)
        }
    })

function guessCompiler(ext: string): string {
    // TODO: add more compilers, which is tricky, because the extension is not enough, it depends on the problem, too.
    switch (ext) {
        case '.c':
            return 'GCC'
        case '.cpp':
        case '.cc':
            return 'Clang++17'
        case '.java':
            return 'JDK'
        case '.py':
            return 'Python3'
        case '.hs':
            return 'GHC'
        default:
            throw new Error(`Unknown extension: ${ext}`)
    }
}

function sign(verdict: string): string {
    switch (verdict) {
        case 'AC':
            return '🟢'
        case 'WA':
            return '🔴'
        case 'EE':
            return '💣'
        case 'CE':
            return '🛠'
        case 'IE':
            return '🔥'
        case 'Pending':
            return '⏳'
        default:
            return '🔴'
    }
}

function audio(verdict: string): string {
    //pixabay.com/sound-effects/search/notification/
    // Sound Effect by <a href="https://pixabay.com/es/users/universfield-28281460/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=199277">UNIVERSFIELD</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=199277">Pixabay</a>

    https: switch (verdict) {
        case 'AC':
            return 'success'
        default:
            return 'failure'
    }
}
