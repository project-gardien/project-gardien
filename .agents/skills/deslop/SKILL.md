---
name: deslop
description: Simplify code by deleting accidental abstractions, dishonest ownership, mirror DTOs, type holes, and needless reshaping. Use when asked to deslop, simplify, remove slop, clean up over-engineered code, reduce abstraction, review for deletion/inlining, or stress-test whether code should exist.
---

# Deslop

Deletion-first cleanup. The goal is less code with clearer ownership, not prettier architecture.

## Workflow

1. Read the touched code and trace the real flow before changing anything.
2. Count call sites with `rg` before judging reuse.
3. Grill before edits: ask every cleanup decision whose answer changes the diff, unless the user explicitly says not to grill. Do not ask for facts the repo can answer.
4. Classify each helper, type, adapter, data object, and file as source of truth, boundary adapter, target-native data, file-owned detail, or accidental abstraction.
5. Delete, inline, or move accidental abstractions.
6. Re-scan the diff for new helpers, casts, DTOs, validators, and fetch shapes that recreate the old smell.
7. Run the smallest relevant check, then the repo-required typecheck/lint/format checks.

## Rules

- Split responsibility by reason to change. Controllers route, validators own request shape, services own domain action.
- Shared mechanics are not shared meaning. Keep helpers only when they name domain behavior; duplicate small logging, timing, try/catch, mapping, or dispatch blocks when sharing hides context.
- Find the axis of variation. Fetch and shape invariant data once; vary only the fields, locales, options, or views that actually differ.
- Type holes are ownership failures. Treat `unknown`, `any`, and type assertions as slop markers. Move type ownership to the source first; validate only hostile/user/external data or high-cost failure paths.
- Keep one source of truth. Delete mirrors, transposers, adapters, and hand-built DTOs that only preserve another shape. Prefer source-native data plus explicit omissions.
- Author data in the target-native shape. Do not add converters to feed a shape you could write directly.
- Delete local-only types. Prefer inference or `as const`; add named types only at real boundaries.
- Keep files honest. A file should contain what its name promises.
- Keep domain values out of labels/translations. Labels describe values; they do not define behavior.
- Move single-use branches into the function that owns the branch.
- Transform already-grouped ordered data directly. Avoid collectors, reducers, and maps unless they remove real complexity.
- Keep public exports narrow. Do not export internal plumbing until another package needs it.
- Typecheck after cleanup, not before using green types as proof the design is good.

## Output

Ship the simplified code. In the final note, name what was deleted or intentionally skipped and which check ran.
