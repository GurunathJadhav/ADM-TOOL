---
type: manifest
id: M-d7e8-cleanup-git
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T163001Z
actor: agent
role: agent
ticket_id: T-c5d6-cleanup-git
status: approved
approved_by: owner (explicit request in chat, 2026-11-17)
---
# Edit Manifest — cleanup + git init

## Allowed paths
- `%TEMP%/af-install-test*` (delete — disposable install test outputs)
- `evals/_gen_golden.py` (delete — build helper, regenerable)
- `.git` (create — git init, add, commit)
- `.agentflow/events/`, `.agentflow/verifications/`, `.agentflow/STATE.md` (records only)

## Not allowed
- Any file under `src/`, `docs/`, `tools/`, `evals/golden-project/`, `evals/scenarios/`
- Policy files
