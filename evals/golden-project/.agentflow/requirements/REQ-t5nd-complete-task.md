---
type: requirement
id: REQ-t5nd-complete-task
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T094500Z
actor: agentflow-worker
role: agent
req_id: REQ-t5nd-complete-task
priority: must
status: baselined
source_answer: owner walkthrough 20261108 (verbatim: "and I need to mark tasks done")
---

# Requirement: Complete a task

**As a** user **I want to** mark a task complete by id **so that** it leaves my
open list but is not deleted.

## Testable statement
`todo-notes complete <id>` sets the task's status to `done` with a completion
timestamp; unknown ids exit 1 with `No task <id>`; completing twice is
idempotent (exit 0).

## Traceability
- Source: owner walkthrough session 20261108T093000Z (batch event
  20261108T090500Z).
- Tickets: T-w9vt-complete-task (delivers).
- Priority must (v1 core).
