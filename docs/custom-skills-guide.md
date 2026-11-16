# Custom Skills Guide

Agentflow skills are short Markdown playbooks in `.agentflow/skills/<name>/SKILL.md`. They load on demand — never in bulk — and project skills **override** shared (framework-shipped) ones with the same name. Overrides are logged and visible; upgrades show a diff against your override rather than silently replacing it.

## SKILL.md structure

Front matter (always English):

```yaml
---
name: <skill-name>
description: <written as a trigger condition — when this skill should activate>
version: 1.0.0
---
```

- **`description` is a trigger condition**, not marketing copy: it must state the situation that activates the skill, because the router matches on it. Descriptions are tested for trigger accuracy.
- **Body sections** (each about one page total, no longer):
  - Purpose
  - When to use
  - Inputs
  - Steps
  - Checklist
  - Anti-patterns
  - "Stop and ask the user if…"
  - Next skills
  - Worked example
- Keep skills to ~one page. Where a weak model fails to follow a rule, simplify the skill (shorter, more examples, stricter template) rather than adding text.

## How agents load skills

Agents with automatic skill loading (e.g. skills mirrored into `.claude/skills/`) pick them up natively. For agents with **no automatic loading**, the router skill (`using-agentflow`) and `/af-next` name the **exact skill file path** to read, e.g.:

```
Read .agentflow/skills/ticket-breakdown/SKILL.md
```

## Changing framework skills

- Project skills in `.agentflow/skills/` override shared ones with the same name — this is the supported way to adapt a playbook to your project.
- Policy-level rule changes (limits, gates, protected paths) are **not** skills — they go through `/af-rule-change` with owner approval and countersign. Skills never override policy files.
- Skills that are part of self-protection (the router, `rule-change`) must reference `workflow-map.md`, not their own tables.

## Complete example

`.agentflow/skills/ticket-breakdown/SKILL.md`:

```markdown
---
name: ticket-breakdown
description: Use when a requirements baseline exists and requirements must be
  turned into implementable user-story tickets, or when an L-size ticket needs
  splitting.
version: 1.0.0
---

# Ticket Breakdown

## Purpose
Turn baselined requirements into S/M-size tickets with testable criteria,
so implementation never starts without a clear, verifiable scope.

## When to use
- After the scope baseline is approved (phase: tickets).
- When any ticket is sized L (must be split).
- On `/af-reopen`, when the fix needs a new `bug`/`change` ticket.

## Inputs
- `requirements/REQ-<id>.md` (status `baselined`)
- `glossary/` definitions
- `environment/` facts (test runner, available commands)

## Steps
1. One ticket per functionality: *As a [persona], I want [capability],
   so that [benefit]*.
2. Given/When/Then acceptance criteria — each must be testable.
3. Per criterion, declare a verification method: `automated-test`,
   `command-output`, `manual-check`, `screenshot/visual`, `static-check`,
   `document-review`, or `user-confirmation`.
4. MoSCoW priority, size (S/M/L; L → split), dependencies, REQ link.
5. Test plan: own-test command, regression-set command, mapping from
   manifest files to test files. Non-functional requirements become
   cross-cutting criteria.
6. Out-of-scope notes and an effort budget (steps, retries, approximate
   tokens — labelled approximate).

## Checklist
- [ ] Every criterion is testable with a declared verification method
- [ ] Every ticket maps to ≥1 REQ (or a logged justification)
- [ ] Size is S or M (L split)
- [ ] Dependencies listed; blocked items recorded
- [ ] Scope outside the baseline was not silently added

## Anti-patterns
- Vague criteria ("works well", "user-friendly")
- L-size tickets, criteria without a verification method
- Adding features nobody asked for (goes through `/af-change` instead)

## Stop and ask the user if…
- A requirement is ambiguous or missing → `/af-ask`
- The work does not map to any baseline requirement
- A dependency or protected path would be needed

## Next skills
`user-story-writing`, `testing-strategy`, `change-control`

## Worked example
REQ "users log in with email+password" →
`T-x4kq-auth` (S, MUST): criterion "Given a registered user, When correct
credentials are submitted, Then a session is created" verified by
`automated-test`.
```
