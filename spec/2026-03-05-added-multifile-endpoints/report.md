# API Directory: File Limit Information

## How the API directory is read

The directory is fetched from `${JUTGE_API_URL}/dir` in `src/directory/load-directory.ts` (lines 6-55):

```typescript
const response = await fetch(`${JUTGE_API_URL}/dir`)
const json = await response.json()
const { info, models, root } = Value.Parse(ApiDir, json)
```

`JUTGE_API_URL` defaults to `https://api.jutge.org/api` (defined in `src/env.ts`).

## Where file count information is defined

The `FilesOptions` type defines how many files an endpoint accepts/returns:

- **`src/directory/types.ts:1-2`** — `type FilesOptions = 'none' | 'one' | 'many'`
- **`src/directory/types-typebox.ts:8-9`** — TypeBox schema version of the same type.

Each `Endpoint` has two optional fields using this type (`src/directory/types.ts:34-35`):

- `ifiles?: FilesOptions` — input files
- `ofiles?: FilesOptions` — output files

### Current usage (from cached `dir.json`):

| Field  | `'none'` | `'one'` | `'many'` |
|--------|----------|---------|----------|
| ifiles | 226      | 11      | 0        |
| ofiles | 218      | 19      | 0        |

No endpoint currently uses `'many'`.

## Code that handles file counts

### 1. API call layer — `src/jutge-api-call.ts:12-62`

Files are appended to a `FormData` as `file_0`, `file_1`, etc. (line 23). Output files are extracted from the response `FormData` (lines 49-59). This layer supports multiple files generically.

### 2. CLI command building — `src/module-cmd.ts`

- **Input files (lines 82-89):** When `ifiles === 'one'`, the last CLI argument is treated as a filename, read, and sent.
- **Output files (lines 250-253):** When `ofiles === 'one'`, a `-o, --output <filename>` option is added.
- **Command setup (lines 338-345):** Only `'one'` is handled. There is a TODO comment on line 345:
  ```
  // TODO(pauek): More files??
  ```

### 3. Output file writing — `src/module-cmd.ts:212-222`

Handles both single and multiple output files (writes them all), so this part already supports `'many'`.

## Key finding

The type system and API call layer support `'many'` files, but the CLI command-building code in `module-cmd.ts` only handles `'one'`. The `'many'` case is unimplemented (marked with a TODO). Currently no API endpoint uses `'many'`, so this hasn't been an issue.
