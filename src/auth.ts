import { Command } from "@commander-js/extra-typings"
import { authAccountCmd } from "./auth-profile"

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



export const authCmd = new Command("auth")
    .description("Manage Jutge.org credentials")

const authLoginCmd = new Command("login")
    .description("Login to Jutge.org")
    .action(() => {
        console.log("Login")
    })

const authLogoutCmd = new Command("logout")
    .description("Logout from Jutge.org")
    .action(() => {
        console.log("Logout")
    })

authCmd.addCommand(authLoginCmd)
authCmd.addCommand(authLogoutCmd)
authCmd.addCommand(authAccountCmd)