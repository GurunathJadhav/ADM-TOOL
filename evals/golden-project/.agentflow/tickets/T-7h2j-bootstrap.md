---
type: ticket
id: T-7h2j-bootstrap
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T104500Z
actor: agentflow-worker
role: agent
title: "Walking skeleton and test setup"
ticket_type: task
lane: standard
moscow: must
size: s
req_links: [REQ-6bqj-add-task, REQ-9s2w-list-tasks, REQ-t5nd-complete-task]
---

# Walking skeleton and test setup (build-order ticket 1)

**As a** developer **I want** a runnable skeleton with pytest wired **so that**
every later ticket verifies against a working harness (S6.2 bootstrap).

## Acceptance criteria (Given/When/Then + method)
1. Given a fresh checkout, When `python -m pytest tests/ -q`, Then one passing
   and one intentionally failing trivial test run and are reported
   (automated-test).
2. Given the CLI entry point, When `python -m todo_notes --help`, Then usage
   text prints and exit code is 0 (command-output).

## Test plan (S4.2)
- Own tests: `python -m pytest tests/test_bootstrap.py -q`
- Regression set: `python -m pytest tests/ -q`
- Manifest→test mapping: `src/todo_notes/__init__.py`, `src/todo_notes/cli.py`
  → `tests/test_bootstrap.py`

## Notes
Status done (events: started 20261109T100000Z → done 20261109T104500Z).
Manifest was the first scaffold manifest, S-size, touching only `src/` and
tests — covered by standing approval SA1. Harness established the default
commands recorded in `environment/`.
