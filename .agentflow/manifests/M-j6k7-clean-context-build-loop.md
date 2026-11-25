---
type: manifest
id: M-j6k7-clean-context-build-loop
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T173101Z
actor: agent
role: implementer
ticket_id: T-g4h5-clean-context-build-loop
status: approved
approved_by: owner (chat request 2026-11-25: avoid context pollution + build loop command for new session)
approval_ref: A-m8n9-clean-context-build
allowed_to_modify:
  - bin/agentflow.js
  - tools/install.py
  - src/commands/af-gate.md
  - src/commands/af-handoff.md
  - src/skills/session-handoff-resume/SKILL.md
  - src/init/workflow-map.md
  - src/init/CHEATSHEET.md
  - src/adapters/AGENTS.md
  - AGENTS.md
  - README.md
  - .agentflow/**
allowed_to_create:
  - tools/agentflow-build.js
  - src/commands/af-build.md
  - src/skills/clean-context-build-loop/SKILL.md
  - .agentflow/**
edit_budget: zero-dep build brief & loop generator, /af-build command, skill, and gate/handoff wiring
---
# Edit Manifest — Clean-Context Build Brief & Loop Command
