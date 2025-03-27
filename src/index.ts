import { createCli } from "./cli"

createCli().then((cli) => cli.parse())

// TODO: Self-upgrade: detect where is `jutge` installed and issue the upgrade command.
