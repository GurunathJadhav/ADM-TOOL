---
type: verification
id: V-h6j7-github-owner
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T174031Z
actor: agent
role: implementer
ticket_id: T-v2w3-github-owner-identity
method: command-output
result: pass
evidence_ref: .agentflow/evidence/T-v2w3-github-owner-identity/github-owner-verification.md
---
# Verification: T-v2w3-github-owner-identity

All ACs pass:
- AC1: `bin/agentflow.js` and `tools/install.py` resolve current GitHub username and hydrate `project.md`.
- AC2: `bin/agentflow.js doctor` verifies populated GitHub owner identity.
- AC3: Decision & confirmation/approval templates and commands explicitly require GitHub username and forbid generic `"owner"` or `"<owner-name>"`.
- AC4: `agentflow-loop.js`, `agentflow-build.js`, `agentflow-report.js`, and `.agentflow/project.md` updated cleanly.
- AC5: Verified on scratch folders & repo checks.
