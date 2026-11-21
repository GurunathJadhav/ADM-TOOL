---
type: manifest
id: M-k0m2-one-command-init
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261121T160001Z
actor: agent
role: agent
ticket_id: T-h8j9-one-command-init
status: approved
approved_by: owner (chat request 2026-11-21: one command for install+loop+doctor)
approval_ref: none
allowed_to_modify:
  - bin/agentflow.js
  - .agentflow/events/
  - .agentflow/verifications/
  - .agentflow/evidence/
  - .agentflow/STATE.md
edit_budget: additive orchestration in bin/agentflow.js only; no new files, no behavior change to underlying tools
---
# Edit Manifest — Single init command combining install + loop + doctor
