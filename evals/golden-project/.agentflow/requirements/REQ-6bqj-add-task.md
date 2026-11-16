---
type: requirement
id: REQ-6bqj-add-task
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T094500Z
actor: agentflow-worker
role: agent
req_id: REQ-6bqj-add-task
priority: must
status: baselined
source_answer: Q-8x3k-storage-format
---

# Requirement: Add a task

**As a** user **I want to** add a task with a short description **so that** I can
capture work before I forget it.

## Testable statement
`todo-notes add "Buy milk"` appends a task to the JSON store with a fresh
sequential id, description "Buy milk", and status `open`, and exits 0.

## Traceability
- Source: Q-8x3k-storage-format (storage answer) + owner walkthrough 20261108.
- Tickets: T-x4kq-add-task (delivers), T-7h2j-bootstrap (harness).
- Priority must (v1 core).
