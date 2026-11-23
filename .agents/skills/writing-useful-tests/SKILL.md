---
name: writing-useful-tests
description: Writing, reviewing, or auditing tests in this project. Use whenever the task involves adding tests, writing a regression test for a bugfix, deciding whether or where something should be tested, creating any .test.ts file, or identifying low-value tests to delete — even if the user just says "add a test for this" or "should we test this?".
---

# Writing useful tests

## The value rule

A test earns its place only if it catches a bug that no other check catches more reliably. Before writing or keeping a test, ask: **what bug would this catch that nothing else would?** If the answer is nothing, don't write it, or delete it.

- Assert outcomes (return values, produced data), not implementation. `expect(mock).toHaveBeenCalledWith(...)` proves the code calls a mock, nothing more.
- A test whose title promises something its `expect`s don't check is worse than no test.
- If another test covers the same case with more confidence, the weaker one is a duplicate. Delete it.

## How tests run here

Vitest, node environment, two suites. Specs are colocated next to the file they test under `src/`.

| Suite | Files | Command | Needs |
|---|---|---|---|
| Unit | `*.test.ts` | `pnpm test` | Nothing: must pass in a bare checkout, no database, no network |
| Integration | `*.int-test.ts` | `pnpm test:integration` | Docker: the script starts the throwaway MySQL itself |

- One file: append the path. One case: append `-t "name"`.
- Vitest does not typecheck. `pnpm typecheck` covers the specs, so run both.

## Integration tests: real MySQL, never mocks

Integration tests matter most here: queries, constraints, transactions, and JSON columns can only be proven against a real database.

- They run against `mysql-test` from `docker-compose.yml`: in-memory, port 3308, database `quiz_test`, wiped when the container restarts. Never the dev database on port 3307.
- Migrations from `drizzle/` are applied before the suite, so a spec also proves the migration matches the schema.
- Call `resetDatabase()` from `#/testing/integration` in `beforeEach`. It empties every table and refuses any database whose name doesn't end in `_test`.
- Use the app's own `getDb()`: the suite points `DATABASE_URL` at the test database.
- Files run one at a time because they share the database.
- Seed with plain inserts that respect the app's write invariants. Assert on query results and database state, not on how a query was built.

## What to test

Good targets: mapping and serialization, branching business rules, parsing, grading, zod transforms and refinements, anything that must stay hidden from the client.

Poor targets: pass-through functions, server-function and route wiring, React components.

- **Pick the suite by what the bug needs to show up.** If the database is part of the behavior, write an integration test. If it's a decision on plain data, write a unit test.
- **Logic buried in I/O:** extract the decision into a pure function and unit-test it. The server function keeps the I/O.
- **Never mock the database client** to assert the arguments it receives. That test breaks on every refactor and catches no real bug. The same goes for mocking half the module graph to reach one `if`: extract the `if` instead.
- **Server functions** can't be called from a test: they sit behind `createServerFn` and the admin cookie. Keep `*.functions.ts` to validation, middleware, and one call into a `*.server.ts` file that holds the database work as plain exported functions, and test those (`src/admin/questions.server.ts` is the model).
- **Component and browser tooling** (jsdom, Testing Library, Playwright) is not installed. Don't add it speculatively; raise it if a real regression calls for it.
- **Bugfix:** write the failing test that reproduces the bug before fixing it. If the bug can't be expressed as a pure-function test, extract the logic as part of the fix.

## Style

Existing tests are not a reference: nothing guarantees their quality, so don't copy their patterns. Follow these rules instead:

- One `describe` per exported function or unit; `it` titles are plain sentences stating the behavior.
- Compact literal inputs, plain `toEqual` / `toBe`. No custom matchers, no snapshots, no fixture files for data a literal can express.
- No comments, as in the rest of the code.
- Cover the edges the code actually branches on: empty input, null, boundaries. Don't add cases that walk the same branch twice.

## Auditing existing tests

Read the `expect`s, not the titles. Delete tests that assert mock calls instead of outcomes, duplicate a stronger test, contain a comment where an assertion should be, or wrap a trivial pass-through. Keep pure-function tests with no stronger equivalent. Fix, don't delete, tests whose scenario is right but whose assertions are missing.

## Before you're done

1. `pnpm test` passes.
2. `pnpm test:integration` passes if you touched the schema, a migration, or anything that queries the database.
3. `pnpm typecheck` passes.
