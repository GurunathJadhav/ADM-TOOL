---
type: requirement
id: REQ-8cvz-due-date
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T094500Z
actor: agentflow-worker
role: agent
req_id: REQ-8cvz-due-date
priority: should
status: proposed
source_answer: Q-2vtp-output-style
---

# Requirement (proposed): Optional due date on add

**As a** user **I want to** optionally attach a due date when adding a task
**so that** I can track deadlines.

## Status: proposed — not in the scope baseline
Follow-up idea raised while answering Q-2vtp-output-style. Proposed only:
per S3, anything outside the baseline needs `/af-change` (impact on
REQ-6bqj-add-task and T-x4kq-add-task, decision record, owner approval)
before any ticket or code work. No ticket claims it yet.

## Testable statement (draft)
`todo-notes add "Pay rent" --due 2026-12-01` stores an optional ISO date field.
