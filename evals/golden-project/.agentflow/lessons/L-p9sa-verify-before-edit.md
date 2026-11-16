---
type: lesson
id: L-p9sa-verify-before-edit
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261109T131500Z
actor: agentflow-worker
role: agent
title: "Read the module before writing the red test"
category: mistake
ticket_ref: T-x4kq-add-task
---

# Lesson: hallucinated function name cost a retry

## What happened
During the add-task red step, the first test imported `add_todo()` — a
function name that does not exist. Import error, one wasted retry.

## Remedy
Run the verify-before-edit checklist first: read the file, confirm every
symbol used exists (S5.3), only then write the test. Repeated on
T-p3rn-list-tasks: `format_list` stub confirmed present before writing red.
