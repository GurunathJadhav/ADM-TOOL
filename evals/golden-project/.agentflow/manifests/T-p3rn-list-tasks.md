---
type: manifest
id: M-p3rn-list-tasks
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261109T163000Z
actor: agentflow-worker
role: agent
ticket_id: T-p3rn-list-tasks
allowed_to_modify:
  - src/todo_notes/cli.py
  - src/todo_notes/format.py
allowed_to_create:
  - tests/test_list.py
explicitly_not_touched:
  - src/todo_notes/store.py
  - pyproject.toml
  - tests/test_add.py
edit_budget:
  max_files: 3
  max_lines: 80
approval_ref: SA1
---

# Edit Manifest — T-p3rn-list-tasks

- `src/todo_notes/format.py` ↔ criteria 1, 2 (numbered lines, empty message)
- `src/todo_notes/cli.py` ↔ criteria 1, 2, 3 (list subcommand wiring)
- `tests/test_list.py` ↔ all criteria (red test already written)

## Approval
Standing approval SA1: S-size manifest touching only `src/` and its tests
(project.md SA1; use logged in event
`20261109T164500Z-T-p3rn-list-tasks-manifest-approved-M-p3rn-list-tasks.md`).

## Verify-before-edit checklist (S5.3)
- Read `format.py` (created by bootstrap); `format_list` stub exists as read.
- Red test failing first; simplicity gate: string join, no table lib.
