---
name: code-standards
description: Project-agnostic coding standards — treat existing code critically, no comments by default, zero tolerance for type casts, Temporal over the Date API, Conventional Commits, run the project's checks before calling work done, and prefer Tailwind theme tokens over arbitrary values. Use when editing, reviewing, or creating code in this project.
---

# Code Standards

## 1. Existing code is not authoritative

- Working code can still be wrong. Don't assume correctness just because it runs.
- Flag smells (poor naming, dead code, wrong abstraction, misplaced logic). Fix them when the refactor stays contained; otherwise note the issue and make the minimal correct change — never copy a bad pattern to match the surroundings.
- Fix root causes, not symptoms.

## 2. Comments: default to none

- Code explains itself through names, types, and structure. A comment is a last resort, not a habit.
- A comment is justified only for a "why" code cannot express: a non-obvious rule or a genuine trap (ordering constraint, browser quirk, performance cliff). One line max — if it takes three, refactor instead.
- Never narrate the "what"; no ticket ids, ruling dates, or decision tags in code.
- Do not adopt the commenting habits of the surrounding code. When your edit touches a line with a redundant comment, delete the comment in the same change.

## 3. Zero tolerance for type casts

- `as any` and double-casts (`as unknown as X`) are banned — no exceptions. They defeat the type system and hide bugs. Same for language-equivalent suppressions and unsafe casts.
- If the types don't line up, the error is deeper — fix the root cause: wrong type definition upstream, missing generic parameter, input/output divergence, or a library/ORM type mismatch. Fix the shape, don't cast over it.
- Narrow, provably safe assertions (`as const`, narrowing a union after a runtime check) are acceptable.
- If a type error cannot be fixed without a banned cast, stop and explain the situation rather than casting.

## 4. Dates: Temporal, not Date

- Never use the legacy `Date` API in code you write. Use the `Temporal` API (`Temporal.Instant`, `Temporal.ZonedDateTime`, `Temporal.PlainDate`…).
- `Date` is tolerated only at boundaries: when an external dependency (library, ORM, API) requires it, convert `Temporal` → `Date` at the last step, and back to `Temporal` immediately on the way in. `Date` never leaks into business logic.
- Temporal is not native in every runtime yet: pair its use with a polyfill (e.g. `@js-temporal/polyfill`) so it works across all target environments.

## 5. Verification

- After any change, run the project's lint, type-check/build, and tests — all must pass before the task is considered done.
- Never disable a lint or type rule to bypass an issue.

## 6. Conventional commits

- Every commit follows the Conventional Commits standard: `type(scope): description`.
- Types: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `build`, `ci`, `chore`. The scope is optional.
- The description is lowercase, imperative, and has no trailing period (e.g. `fix(drawer): veto close while dirty`).
- Breaking changes are flagged with `!` after the type (`feat!:`) or a `BREAKING CHANGE:` footer.

## 7. Tailwind — tokens over ad-hoc brackets

- Class names never carry arbitrary values in brackets (`text-[12px]`, `w-[104px]`, raw hex, hand-composed `shadow-[…]`). Styling resolves through the theme tokens defined in the project's CSS.
- Bare numeric scale values (`w-26`, `leading-4.25`, `scale-108`) are fine.
- A bracket is a last resort for a genuine one-off; the moment a value appears a second time, it becomes a token.
