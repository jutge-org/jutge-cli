# Jutge Command Line Interface

This is a command line interface for the Jutge platform. It allows you to download problems, submit solutions, and check your progress.

## Execution

```bash
bun index.ts --help             # get help
bun index.ts misc fortune       # test
bun index.ts init               # configure
bun index.ts login              # login to Jutge.org
bun index.ts profile            # display user profile
bun index.ts submit P68688_en tests/P68688.c   # submit a solution
```

## Installation

Run

```bash
bun run compile
```

to get a binary file in the `bin` folder.
