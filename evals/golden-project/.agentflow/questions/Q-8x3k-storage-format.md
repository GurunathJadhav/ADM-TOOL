---
type: question
id: Q-8x3k-storage-format
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T090500Z
actor: agentflow-worker
role: agent
category: architecture
blocking: true
answer_needed_from: owner
---

# Question: How are tasks stored between runs?

## Question
Single JSON file vs SQLite vs CSV for persisting tasks?

## Why it matters
Decides the store module's shape and whether any dependency is needed.

## Recommended default
One JSON file (`todo-notes.json` in the app directory) — stdlib `json`, trivially
inspectable, no dependency.

## Verbatim answer
"Single JSON file is fine, stdlib only." — owner, 20261108T091000Z
(answer event: `events/20261108T091000Z-none-status-change-Q-8x3k-storage-format.md`)

## Result
Answered (blocking). Source requirement: REQ-6bqj-add-task.
