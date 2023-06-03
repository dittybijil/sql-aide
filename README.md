# SQL Aide (SQLa) Typescript template literals optimized for emitting SQL

[![codecov](https://codecov.io/gh/netspective-labs/sql-aide/branch/main/graph/badge.svg?token=DPJICL8F4O)](https://codecov.io/gh/netspective-labs/sql-aide)

SQL Aide (`SQLa`) is a suite of Deno TypeScript modules which use the power of
JavaScript functions and
[Template literals (Template strings)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
to prepare SQL components as composable building blocks ("SQL partials"). `SQLa`
is like a static site generator but instead of generating HTML, it generates SQL
files and other database artifacts for SQL-heavy apps and services.

`SQLa` targets services or applications that must assemble and load SQL into in
a deterministically reproducible manner. `SQLa` is an _aide_ which helps
prepare, organize, assemble, load, and revision manage type-safe,
_deterministically reproducible_, SQL code.

Instead of inventing yet another template language, `SQLa` uses a set of naming
conventions plus the full power of JavaScript (and TypeScript) template strings
to prepare the final SQL that will be assembled and loaded into (mostly)
relational databases.

## Init after clone

This repo uses git hooks for maintenance, after cloning the repo in your sandbox
please do the following:

```bash
deno task init
```

## Documentation

SQLa documentation is available at https://netspective-labs.github.io/sql-aide/.

### Local Documentation Server

If you're modifying the documenation or would like to use it locally without
Internet access, start the server and launch the site:

```bash
cd support/docs-nextra
pnpm install    # first time or whenever you do a pull
pnpm next       # docs are available at http://localhost:3000
```

We use [Nextra](https://nextra.site/) as document publishing framework.

## Unit Testing

```bash
deno test
```

## Tagging and pushing commits

When you're ready to push code:

```bash
deno task git-hook-pre-commit   # run all tests/validation that will be run by Git commit hook so there are no surprises
git commit -m ...               # commit your if the above shows no errors
deno task prepare-publish       # bump the version tag and prepare for push
git push                        # push the code with the bumped version
```

## NPM Packaging

We are experimenting with taking the Deno code and producing NPM packages. This
doesnt work for the `pattern` or `examples` directories but the core `SQLa`
render package should work.

Build the NPM package

```bash
deno task prepare-npm
```

Publish the NPM package

```bash
deno task publish-npm
```

To publish this package, you will need the necessary permissions. Please contact
the `netspective-labs` organization to obtain the required permissions if you
don't have them yet.
