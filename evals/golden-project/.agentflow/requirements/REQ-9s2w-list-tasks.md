---
type: requirement
id: REQ-9s2w-list-tasks
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T094500Z
actor: agentflow-worker
role: agent
req_id: REQ-9s2w-list-tasks
priority: should
status: baselined
source_answer: Q-2vtp-output-style
---

# Requirement: List open tasks

**As a** user **I want to** list my open tasks **so that** I can see what is
left to do.

## Testable statement
`todo-notes list` prints open tasks as numbered plain lines (`1. Buy milk`),
skips completed tasks, and prints `No tasks yet.` (exit 0) on an empty store.

## Traceability
- Source: Q-2vtp-output-style (owner chose numbered plain lines).
- Tickets: T-p3rn-list-tasks (delivers); T-d6tb-list-output-bug (regression guard).
- Priority should (v1.x; owner ranked it after add).
