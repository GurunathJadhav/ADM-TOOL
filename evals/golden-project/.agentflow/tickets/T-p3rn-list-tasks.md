---
type: ticket
id: T-p3rn-list-tasks
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T104500Z
actor: agentflow-worker
role: agent
title: "List open tasks"
ticket_type: story
lane: standard
moscow: must
size: s
req_links: [REQ-9s2w-list-tasks]
---

# List open tasks (build-order ticket 3)

**As a** user **I want to** list my open tasks **so that** I can see what is
left to do. (REQ-9s2w is `should`; ticket is `must` because the v1 demo needs
it.)

## Acceptance criteria (Given/When/Then + method)
1. Given a store with 3 tasks of which 1 is done, When `todo-notes list`,
   Then exactly the 2 open tasks print as `1. <desc>`, `2. <desc>` numbered
   lines, in insertion order (automated-test).
2. Given an empty store, When `todo-notes list`, Then `No tasks yet.` prints
   and exit code is 0 (automated-test).
3. Given any list run, When output is inspected, Then the format matches the
   numbered-plain-lines style confirmed in Q-2vtp-output-style (manual-check).

## Test plan (S4.2)
- Own tests: `python -m pytest tests/test_list.py -q`
- Regression set: `python -m pytest tests/ -q`
- Manifest→test mapping: `src/todo_notes/format.py` → `tests/test_list.py`;
  `src/todo_notes/cli.py` → `tests/test_list.py`

## Notes
Status in-progress (started 20261110T090000Z). Red test written; first green
micro-step pending — next action `/af-verify`. Colour polish blocked by
B-5wqj-terminal-colours.
