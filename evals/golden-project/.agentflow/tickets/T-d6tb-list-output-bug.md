---
type: ticket
id: T-d6tb-list-output-bug
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261110T090000Z
actor: agentflow-worker
role: agent
title: "Bug: add with empty description crashes"
ticket_type: bug
lane: standard
moscow: should
size: s
req_links: [REQ-6bqj-add-task]
---

# Bug: `todo-notes add ""` crashes with IndexError

Regression found against REQ-6bqj-add-task after T-x4kq-add-task was done
(frozen code — changes need this bug ticket + manifest, S5.6).

## Reproduction (recorded before any fix, S5.3)
`todo-notes add ""` → `IndexError: list index out of range` traceback, exit 1.
Failing test exists in the repro session notes; cause: `args.description` is
`""`, truthiness check skips the usage branch, `parts[1]` explodes.

## Acceptance criteria (Given/When/Then + method)
1. Given an empty description, When `todo-notes add ""`, Then exit code 1 with
   usage message `Usage: add <description>`, no traceback (automated-test).
2. Given the fix, When the full suite runs, Then regression stays green
   (automated-test).

## Test plan (S4.2)
- Own tests: `python -m pytest tests/test_add.py::test_add_empty_description -q`
- Regression set: `python -m pytest tests/ -q`
- Manifest→test mapping: `src/todo_notes/cli.py` → `tests/test_add.py`

## Notes
Status backlog. Verify-before-edit: reproduction above is the required failing
evidence before touching `src/todo_notes/cli.py`.
