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

## Amendment 1 (2026-11-17, after git add revealed additional test artifacts)
- `evals/scale/` (delete — generated 200-ticket scale-test project, pure test data)
- `evals/state-fixtures/` (delete — 54 generated fixtures + `_gen_fixtures.py` generator)
- `evals/scenarios/bad-behaviour/` and `evals/scenarios/wrong-command/` (delete — superseded
  duplicates; the spec'd 12 SCN scenarios and the wrong-command rows inside
  `guidance-fixtures.md` are the canonical sets)
- `tools/validate.mjs`, `tools/validate.ps1`, `tools/validate.sh` (delete — alternate-language
  validator variants superseded by the owner's Python decision, D-validated-language)
- `tools/__pycache__/` (delete — cache junk; add to .gitignore)
- `evals/RUN-EVALS.md` line 75 (edit — drop the removed state-fixtures reference)

## Not allowed
- Any file under `src/`, `docs/`, `tools/`, `evals/golden-project/`, `evals/scenarios/`
- Policy files
