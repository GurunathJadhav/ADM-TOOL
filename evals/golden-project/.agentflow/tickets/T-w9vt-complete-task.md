---
type: ticket
id: T-w9vt-complete-task
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T104500Z
actor: agentflow-worker
role: agent
title: "Complete a task by id"
ticket_type: story
lane: standard
moscow: must
size: s
req_links: [REQ-t5nd-complete-task]
---

# Complete a task by id (build-order ticket 4)

**As a** user **I want to** mark a task complete by id **so that** it leaves my
open list but is not deleted.

## Acceptance criteria (Given/When/Then + method)
1. Given task 2 is open, When `todo-notes complete 2`, Then the store shows
   task 2 with status `done` and a completion timestamp (automated-test).
2. Given id 99 does not exist, When `todo-notes complete 99`, Then exit code 1
   and message `No task 99` (automated-test).
3. Given task 2 is already done, When completing again, Then the store is
   unchanged, exit 0 (idempotent) (automated-test).

## Test plan (S4.2)
- Own tests: `python -m pytest tests/test_complete.py -q`
- Regression set: `python -m pytest tests/ -q`
- Manifest→test mapping: `src/todo_notes/store.py` → `tests/test_complete.py`;
  `src/todo_notes/cli.py` → `tests/test_complete.py`

## Notes
Status backlog. Dependencies: T-x4kq-add-task (store format, done),
T-p3rn-list-tasks (store module touchpoints). No manifest yet — claim via
`/af-edit-plan` when scheduled.
