import { Command } from "@commander-js/extra-typings"
import print from "./print"

import { JutgeObjectModel } from "@jutge.org/client-ts"

const jom = new JutgeObjectModel()

export const tablesCmd = new Command("tables").description("Get tables")

tablesCmd
    .command("languages")
    .description(`Display languages table`)
    .action(async () => {
        print.normal(await jom.languages.all())
    })

tablesCmd
    .command("countries")
    .description(`Display countries table`)
    .action(async () => {
        print.normal(await jom.countries.all())
    })

tablesCmd
    .command("compilers")
    .description(`Display compilers table`)
    .action(async () => {
        print.normal(await jom.compilers.all())
    })

tablesCmd
    .command("drivers")
    .description(`Display drivers table`)
    .action(async () => {
        print.normal(await jom.drivers.all())
    })

tablesCmd
    .command("verdicts")
    .description(`Display verdicts table`)
    .action(async () => {
        print.normal(await jom.verdicts.all())
    })

tablesCmd
    .command("proglangs")
    .description(`Display proglangs table`)
    .action(async () => {
        print.normal(await jom.proglangs.all())
    })
