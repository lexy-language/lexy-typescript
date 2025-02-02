# lexy-typescript

[![Build lexy-typescript](https://github.com/lexy-language/lexy-typescript/actions/workflows/build.yml/badge.svg)](https://github.com/lexy-language/lexy-typescript/actions/workflows/build.yml)

Implementation of the [lexy-language](https://github.com/lexy-language/lexy-language) in typescript. 
Check the [lexy-language](https://github.com/lexy-language/lexy-language) or the online [demo](https://lexy-language.github.io/lexy-demo/)
to understand the purpose of Lexy.

npm JavaScript package: **todo**

# Contribution

Check [lexy-language](https://github.com/lexy-language/lexy-language) for more information about how to contribute.

## Known improvements

- [ ] Code: get rid of all warnings, make the source maps work
- [ ] Packaging: publish npm package (use is on **lexy-editor**)


# Implementations notes

## Run locally

Ensure node.js (v16 or above) is installed.
Tested with node.js v16.20.2.

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

## Circular references
`import type`
