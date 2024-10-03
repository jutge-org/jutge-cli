# Jutge Command Line Interface

This is a command line interface for the Jutge platform. 

WARNING: This is pre-alpha software, expect a rough experience.

Eventually, it will allow you to download problems, submit solutions, and check your progress, and in general perform operations in the Jutge.org platform.

## Installation

Jutge CLI is at [NPM](https://www.npmjs.com/package/@jutge.org/cli), so the easiest way to get it is:

```bash
bun add -g @jutge.org/cli
```

After that, you will have an executable called `jutge` in your `PATH`.

You don't even need to have installed permanently:

```bash
bunx @jutge.org/cli misc fortune
```g

## Installing from source

Install [Bun](https://bun.sh), clone this repo and run:

```bash
bun run build
```

Then get the binary file from the `bin` folder.


