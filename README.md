# Setup

## Run locally

Compile
`tsc`

Run tests
`yarn test`

Check circular dependencies
`yarn check-circular-dependencies`


## Known Todo's

- [ ] Document versioning strategy for lexy-langage and it's dependencies.

# Implementations notes

## Submodules

**lexy-language** is included as a git submodule. 
- **lexy-language** is used in the automated tests to 
ensure that the parser and compiler are running against the latest lexy language specifications.

To update the submodule to the latest version: `cd tests/lexy-language/ && git pull` (ensure you pull the right branch is you're implementing a new branch of lexy-language)

## Circular references
`import type`