---
type: manifest
id: M-f6g7-node-install-loop
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261121T090001Z
actor: agent
role: agent
ticket_id: T-d4e5-node-install-loop
status: approved
approved_by: owner (chat request 2026-11-21: npx install + loop + no-coding gate)
approval_ref: none
allowed_to_modify:
  - package.json
  - bin/agentflow.js
  - tools/agentflow-gate.js
  - tools/agentflow-loop.js
  - docs/quickstart.md
  - tools/install.py
  - tools/validate.py
  - .agentflow/events/
  - .agentflow/verifications/
  - .agentflow/evidence/
  - .agentflow/STATE.md
edit_budget: additive Node.js CLI layer; no existing Python installer/validator behavior changed; no policy files modified
---
# Edit Manifest — Node.js/npx installer with question loop and no-coding gate
