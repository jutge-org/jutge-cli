import chalk from 'chalk'

const Command = chalk.yellow
const Output = chalk.green
const Title = chalk.bold.blue

export const accountsManualText: string = `
${Title(`Command Line Interface (CLI)`)}

${Title(`Usage`)}

The CLI itself can be used to get documentation (also available at \`https://api.jutge.org\`), since it uses the endpoint information (the "directory") and maps endpoints and endpoint groups to commands or subcommands.

For example, just invoking \`jutge\` produces a list of available commands and by invoking \`jutge student\` you receive help about the \`student\` section of the API. Also, the mapping from the API to the commands is straightforward, and therefore using the CLI is a good way to get to know the API and its endpoints.

So, before invoking any of the endpoints, you can explore what is available and get help about each endpoint (if available!). Also, appending \`--help\` to any invocation will give you help, even if you already provided arguments or options, so it is a good way to make sure you are using the CLI correctly.


${Title(`Options and Parameters`)}

In general, when an endpoint of the API receives only one piece of data, it will be an argument. For instance, the argument in this call is the award's ID:

${Command(`jutge student awards get A0012284589`)}

For endpoints that require specifying several fields, long options (with two dashes) are typically used:

${Command(`jutge instructor queries getCourseProblemSubmissions \\
    --course_nm "PRO3_2028" \\
    --problem_nm "P86886_ca"`)}

Whenever there are input files to an API call, they are always arguments. For instance, changing your avatar is:

${Command(`jutge student profile updateAvatar selfie_at_VLA.png`)}

The argument just indicates a path to a file which will be read and sent to the API.


${Title(`Authentication`)}

The CLI can send direct calls to the API to retrieve a token (with \`jutge auth login\`), but a more user-friendly way is to use the \`login\`, \`logout\` and \`accounts\` subcommands (whih are not to be confused with \`auth login\` and \`auth logout\`).


${Title(`Logging in`)}

To login, use the command:

${Command(`jutge login`)}

This will prompt for your email and password. A second execution in the same computer will only prompt for the password since the email will be internally associated with de "default account". Changing that is easy:

${Command(`jutge login -e pedro.botero@infer.no`)}


${Title(`Logging out `)}

To logout, use the command:

${Command(`jutge logout`)}

This will log you out (and discard the token).


${Title(`Accounts`)}

Since many professors use more than one account, the CLI allows you to register and manage several accounts. This is done with the \`accounts\` subcommand:

${Command(`jutge accounts list`)}
${Output(`* default - pedro.botero@infer.no (logged in until 03/14/1592, 05:04:03)`)}

The \`*\` indicates the active account. Since at the beginning there is only one account (name "default"), it is the active one. You can add more accounts with:

${Command(`jutge accounts add -e pro3@cs.upc.edu pro3`)}
${Output(`Account 'pro3' added.`)}

This will add the "pro3" account with its email. Listing accounts should show:

${Command(`jutge accounts list`)}
${Output(`* default - pedro.botero@infer.no (logged in until 03/14/1592, 05:04:03)
  pro3 - pro3@cs.upc.edu`)}

If you plan to use the "pro3" account for a while, you can activate it with:

${Command(`jutge accounts use pro3`)}
${Output(`Account 'pro3' is now the active account.`)}

You can also use the "pro3" account in just one endpoint call (and therefore keep the currently active account), by using the \`-a\` option, which is available in all endpoints:

${Command(`jutge login -a pro3`)}
${Command(`jutge student profile -a pro3`)}

Once you are done with the "pro3" account, you can remove it:

${Command(`jutge accounts remove pro3`)}
${Output(`Account 'pro3' removed.`)}

The "default" account is always available and cannot be removed.
`
