---
type: decision
id: D-c8s2-json-storage
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261109T091500Z
actor: agentflow-worker
role: agent
title: "Store tasks in a single JSON file"
decision_type: two-way
status: approved
supersedes: none
---

# ADR: JSON-file storage

## Context
Tasks must survive between runs (Q-8x3k-storage-format). Solo user, small data.

## Options
1. Single JSON file (stdlib `json`) — chosen
2. SQLite (stdlib) — more power than needed, opaque file format
3. CSV — awkward for nested fields, no atomic rewrite

## Decision
One JSON file `todo-notes.json` holding a list of task dicts. Two-way: cheap to
migrate later (write a converter ticket). Owner confirmed in Q-8x3k.

## Consequences
Zero dependencies; whole-file rewrite on save acceptable at this scale; store
module isolated so a future backend swap is contained.
