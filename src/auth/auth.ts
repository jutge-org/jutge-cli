import { Command } from "@commander-js/extra-typings"
import { printStdout } from "../print"
import { login, logout, examLogin } from "./credentials-file"

/*

(These commands all use the "main" account.)

1. jutge auth login --username <username> --password <password> (also -u and -p)
   If no username or password is provided, prompt for them.
   Save the credentials in a file.

2. jutge auth logout
   Remove the credentials file.

3. jutge auth whoami
   Show the current user's email.

4. jutge auth expires
   Show the expiration date of the current credentials.

Different accounts
------------------
Accounts are always there, but if you don't look at them, you are just
using the default one.

1. jutge auth account add <name> --username <username> --password <password>
   Add a new account with the given name and credentials.

2. jutge auth account use <name>
   Use the profile with the given name.

3. jutge auth account list
   List all the profiles.

4. jutge auth account remove <name>
   Remove the profile with the given name.

5. jutge auth account rename <name> <new-name>
   Rename the profile with the given name.

*/

// TODO(pauek): Option to renew credentials (--renew)?

export const loginCmd = new Command("login")
    .description("Login to Jutge.org")
    .option("-e, --email <email>", "Email")
    .option("-p, --password <password>", "Password")
    .option("-a, --account <name>", "Account to use (instead of the active one)")
    .action(async ({ account, email, password }) => {
        printStdout(await login(account, email, password))
    })

export const examLoginCmd = new Command("login-exam")
    .description("Login to exam.Jutge.org")
    .option("-e, --email <email>", "Email")
    .option("-p, --password <password>", "Password")
    .option("-x, --exam <exam>", "Exam to login to")
    .option("-s, --secret <secret>", "Secret for the exam")
    .option("-a, --account <name>", "Account to use (instead of the active one)") // TODO: ??
    .action(async ({ account, email, password, exam, secret }) => {
        printStdout(await examLogin(account, email, password, exam, secret))
    })

export const logoutCmd = new Command("logout")
    .description("Logout from Jutge.org")
    .option("-a, --account <name>", "Account to use (instead of the active one)")
    .action(async ({ account }) => {
        printStdout(await logout(account))
    })
