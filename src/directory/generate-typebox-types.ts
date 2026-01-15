import * as Codegen from '@sinclair/typebox-codegen'

const types = await Bun.file(`types.ts`).text()
const typeboxTypes = Codegen.TypeScriptToTypeBox.Generate(types)
await Bun.file(`types-typebox.ts`).write(typeboxTypes)
