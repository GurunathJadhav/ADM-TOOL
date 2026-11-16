---
type: event
id: E-h5j4-reconcile
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261116T182700Z
actor: agent
role: agent
event_type: external-change
ticket_id: none
summary: Subagent wrote 3 stack packs outside edit lock; reconciled and accepted
evidence_refs:
  - src/stacks/node-typescript.md
  - src/stacks/python.md
  - src/stacks/generic.md
---

# Reconciliation: subagent stack-pack writes

Three stack pack files were written by a delegated subagent without a ticket or manifest
(edit lock was on). Reconciled per /af-reconcile: the files are accepted as framework content
(read-only hint files, no project state touched), and the process gap is logged. Going forward,
delegated work must be covered by a ticket and manifest before edits.
