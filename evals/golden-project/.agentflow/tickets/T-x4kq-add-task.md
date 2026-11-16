---
type: ticket
id: T-x4kq-add-task
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T104500Z
actor: agentflow-worker
role: agent
title: "Add a task to the store"
ticket_type: story
lane: standard
moscow: must
size: s
req_links: [REQ-6bqj-add-task, REQ-8cvz-due-date]
---

# Add a task (build-order ticket 2)

**As a** user **I want to** add a task with a short description **so that** I
can capture work before I forget it.

## Acceptance criteria (Given/When/Then + method)
1. Given an empty store, When `todo-notes add "Buy milk"`, Then exit 0 and the
   store holds task id 1, description "Buy milk", status open (automated-test).
2. Given a store with 2 tasks, When adding again, Then the new task gets id 3
   and no id is ever reused (automated-test).
3. Given a successful add, When the command runs, Then it prints
   `Added task 3` (command-output).

## Test plan (S4.2)
- Own tests: `python -m pytest tests/test_add.py -q`
- Regression set: `python -m pytest tests/ -q`
- Manifest→test mapping: `src/todo_notes/store.py` → `tests/test_add.py`;
  `src/todo_notes/cli.py` → `tests/test_add.py`

## Notes
Done 20261109T131500Z. Red first (V-h7zq fail), then green (V-s5pw pass with
evidence), full-suite regression pass (V-w6rd), independent review R-m4pw
approved. REQ-8cvz-due-date stays `proposed` — this ticket does not deliver it.
