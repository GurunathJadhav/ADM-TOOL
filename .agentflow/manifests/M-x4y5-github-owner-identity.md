---
type: manifest
id: M-x4y5-github-owner-identity
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T173700Z
actor: agent
role: implementer
ticket_id: T-v2w3-github-owner-identity
status: approved
approved_by: GurunathJadhav
approval_ref: A-z6a7-github-owner-identity
allowed_to_modify:
  - bin/agentflow.js
  - tools/install.py
  - tools/agentflow-loop.js
  - tools/agentflow-build.js
  - tools/agentflow-report.js
  - src/templates/decision.md
  - src/templates/approval.md
  - src/commands/af-start.md
  - src/commands/af-decide.md
  - src/commands/af-confirm-understanding.md
  - src/commands/af-gate.md
  - src/commands/af-accept.md
  - src/commands/af-glossary.md
  - src/commands/af-edit-plan.md
  - src/commands/af-approvals.md
  - .agentflow/**
allowed_to_create:
  - .agentflow/**
edit_budget: resolve GitHub username into project.md and enforce GitHub username in decision/confirmation records
---
# Edit Manifest — GitHub Username Owner Identity
