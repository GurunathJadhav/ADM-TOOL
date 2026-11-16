---
type: question
id: Q-4hwn-csv-export
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261108T090500Z
actor: agentflow-worker
role: agent
category: scope
blocking: false
answer_needed_from: owner
---

# Question: Should v1 export completed tasks to CSV?

## Question
Add a `todo-notes export tasks.csv` command in v1?

## Why it matters
Adds a second output path and format code to the MVP boundary.

## Recommended default
No — keep v1 to add/list/complete; revisit after release.

## Deferral reason
Owner deferred at discovery, 20261108T091600Z: "Not for v1; maybe later."
Logged as deferred (non-blocking). Not part of the scope baseline; any later
work goes through `/af-change`.
