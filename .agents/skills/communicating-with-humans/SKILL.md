---
name: communicating-with-humans
description: Writing anything a human developer will read — a PR description, an issue or review comment, a README section, a design note, a Slack message. Use whenever producing such a document.
---

# Communicating with humans

The reader did not conceive this work and does not want to read a lot to understand it. Write the least that lets them understand and review it.

- Open with what changed, in one or two sentences.
- Then list the big decisions only, one line each, with the reason when it isn't obvious.
- Leave out what the diff already shows: file lists, renames, the path you took, what you tried first.
- Mention a risk only if the reader would be surprised by it.
- Setup and run instructions belong in the README, not here.
- No generated-by or tool attribution line.
- Use plain words and short sentences. No filler, no praise of the work.
- If it is longer than one screen, cut it.

## PR description

```markdown
One or two sentences: what this PR does.

## Decisions
- Big decision, and why if not obvious.
```
