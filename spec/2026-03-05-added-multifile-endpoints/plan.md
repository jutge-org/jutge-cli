# Plan: Support `'many'` input files in CLI commands

## Context

The `FilesOptions` type already supports `'none' | 'one' | 'many'`, and the API call layer
(`jutge-api-call.ts`) already handles arrays of files. The gap is in `module-cmd.ts`, which
only handles `'one'` for input files.

## Changes (all in `src/module-cmd.ts`)

### 1. Command building (`endpointCommand`, ~line 336)

Add handling for `ifiles === 'many'` after the existing `ifiles === 'one'` block:

```typescript
if (endpoint.ifiles === 'many') {
    cmd.argument('<files...>', 'Input files')
    numArgs++
}
```

Commander's `<files...>` syntax collects all remaining positional args into an array.

Remove the `// TODO(pauek): More files??` comment.

### 2. Argument parsing (`parseArgs`, ~line 82)

Add a case for `ifiles === 'many'` after the existing `ifiles === 'one'` block:

```typescript
if (ifiles === 'many') {
    const filenames: string[] = args[args.length - 1]  // Commander passes variadic as array
    for (const filename of filenames) {
        const bytes = await readFile(filename)
        inputFiles.push(new File([bytes], basename(filename)))
    }
}
```

## Files touched

- `src/module-cmd.ts` — all changes are in this single file.

## What does NOT need to change

- `src/jutge-api-call.ts` — already handles arrays of files for both input and output.
- `src/directory/types.ts` / `types-typebox.ts` — `FilesOptions` already includes `'many'`.
