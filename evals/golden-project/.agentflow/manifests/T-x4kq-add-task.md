---
type: manifest
id: M-x4kq-add-task
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261109T105500Z
actor: agentflow-worker
role: agent
ticket_id: T-x4kq-add-task
allowed_to_modify:
  - src/todo_notes/cli.py
  - src/todo_notes/store.py
allowed_to_create:
  - tests/test_add.py
explicitly_not_touched:
  - pyproject.toml
  - src/todo_notes/format.py
  - tests/test_bootstrap.py
edit_budget:
  max_files: 3
  max_lines: 80
approval_ref: A-9f2w-manifest-add
---

# Edit Manifest — T-x4kq-add-task

- `src/todo_notes/store.py` ↔ criteria 1, 2 (append + sequential ids)
- `src/todo_notes/cli.py` ↔ criteria 1, 3 (command wiring + output)
- `tests/test_add.py` ↔ all criteria (new test file, red first)

## Verify-before-edit checklist (S5.3)
- Read current `cli.py` and `store.py`; `append_task`/`load_store` exist as read.
- Red test written and failing before any source edit (V-h7zq).
- Simplicity gate: plain dict-in-JSON list; no classes needed.

Budget: S → max 3 files / 80 lines. Anything unlisted: `/af-expand-scope`.
