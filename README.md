# lexy-typescript v0.1

[![Build lexy-typescript](https://github.com/lexy-language/lexy-typescript/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/lexy-language/lexy-typescript/actions/workflows/build.yml) ![Coverage](https://gist.githubusercontent.com/lexy-language/9179085a171f9629b868662611e06fbd/raw/badges.svg)

Implementation of the [lexy-language](https://github.com/lexy-language/lexy-language) in typescript. 
Check the [lexy-language](https://github.com/lexy-language/lexy-language) or the online [demo](https://lexy-language.github.io/lexy-demo/)
to understand the purpose of Lexy.

npm JavaScript package: **todo**

# Contribution

Check [lexy-language](https://github.com/lexy-language/lexy-language) for more information about how to contribute.

## Known improvements

- [ ] Code: get rid of all warnings, make the source maps work
- [ ] Packaging: publish npm package (use it on **lexy-editor**) from GitHub Actions (split compiler from runtime?)
- [ ] Readme: Use /coverage/badges.svg from publish gh-page (once repo is public)
- [ ] Code: verify new, extract, and fill functions work with custom types and table row types

# Implementations notes

## Compiler implementation

The typescript compiler is a port from the [dotnet compiler](https://github.com/lexy-language/lexy-dotnet/).

Every change to the compiler should be discussed first and implemented in all other compilers.

## Run locally

Ensure node.js (v18 or above) is installed.
Tested with node.js v18.20.8.

Compile
`tsc`

Run tests
`yarn test`

Check circular dependencies
`yarn check-circular-dependencies`

## Submodules

**lexy-language** is included as a git submodule. 
- **lexy-language** is used in the automated tests to 
ensure that the parser and compiler are running against the latest lexy language specifications.

To update the submodule to the latest version: `cd tests/lexy-language/ && git pull` (ensure you pull the right branch is you're implementing a new branch of lexy-language)

## Circular references (import)

`import type` is used to import interfaces without creating a circular reference.

## Floating point precision

To avoid floating-point manipulation problems `decimal.js` is used internally to handle number operations.