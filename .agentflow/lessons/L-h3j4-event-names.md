---
type: lesson
id: L-h3j4-event-names
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261116T182620Z
actor: agent
role: agent
category: mistake
ticket_ref: none
title: Event filenames with hyphenated ids are ambiguous for naive parsers
---
# Event filenames with hyphenated ids are ambiguous for naive parsers

## What happened
The validator initially parsed event filenames with `rsplit("-", 2)` to extract
`<ticket>-<event-type>-<record-id>`. Because record ids themselves contain hyphens
(`T-x4kq-done-noev`), the split landed in the wrong place and the done-without-evidence
check silently never fired — caught only when the fixture test ran.

## Fix
Filename-as-index parsing must match on known event-type tokens
(`-ticket-done-`, `-ticket-created-`, …) and take the segment before the token as the ticket id.
See `tools/validate.py::latest_ticket_status`.

## Rule of thumb
Never split convention-structured filenames on a separator that also appears inside field values;
token-match the fixed parts instead. Test every check with a fixture that exercises it.

## Addendum (2026-11-17, recurrence)
The same defect class resurfaced via regex backtracking: the ticket-status parser used a GREEDY
id group `([A-Za-z0-9-]+)` before the alternation `(ticket-[a-z-]+|done|…)`, so for a
`-ticket-done-` filename it backtracked and split at the bare `-done-` inside the token,
minting a phantom ticket id (`T-e5f6-licence-ticket`). Golden fixtures had only used the bare
`-done-` shape, so the bug was invisible until a real `ticket-done` event existed.
Fix: lazy id group `+?` so the FIRST valid token wins; asserted with a split check covering
both filename shapes. Convention reminder: avoid token words (`done`, `pass`, `fail`) inside
record-id slugs — `E-q3r4-licence-done` parses correctly only because the lazy group anchors
at the first token.

