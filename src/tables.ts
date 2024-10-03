import { Command } from "@commander-js/extra-typings"
import print from "./print"

import { JutgeObjectModel } from "@jutge.org/client-ts"

const jom = new JutgeObjectModel()

export const tablesCmd = new Command("tables").description("Get tables")

const formattedPrintFunctions = {
    json: print.json,
    yaml: print.yaml,
    table: print.table,
    yml: print.yaml,
}

for (const table of ["languages", "countries", "compilers", "drivers", "verdicts", "proglangs"]) {
    tablesCmd
        .command(table)
        .description(`Show ${table} table`)
        .option("-f <format>", "Choose format: json, yaml, table", "table")
        .action(async (options) => {
            const func = formattedPrintFunctions[options.f]
            if (func) {
                func(await jom[table].all())
            } else {
                const formats = Object.keys(formattedPrintFunctions)
                print.error(
                    [
                        `Unknown format: ${options.f}\n`,
                        `Valid formats are: ${formats.join(", ")}`,
                    ].join()
                )
            }
        })
}
