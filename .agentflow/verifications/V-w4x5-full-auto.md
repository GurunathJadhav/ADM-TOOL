---
type: verification
id: V-w4x5-full-auto
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T175755Z
actor: agent
role: implementer
ticket_id: T-k3m4-full-python-cli-automation
method: command-output
result: pass
evidence_ref: .agentflow/evidence/T-k3m4-full-python-cli-automation/full-auto-verification.md
---
# Verification: T-k3m4-full-python-cli-automation

All ACs pass:
- AC1: `tools/scripts/af_records.py` implements `env-probe` (`ENV-jbk0-runtime`, UTF-8 BOM-safe `package.json` script detection) and `req --batch-stdin`.
- AC2: `tools/scripts/af_test_runner.py` implements `diff-check` (manifest verification + secret/`debugger`/`pdb` hygiene scan) and `smoke` (`--check-file`, `--exec`, HTTP `--url`, `--start`).
- AC3: `tools/scripts/af_gate_runner.py` implements `coverage` (`traceability.md`), `next` (deterministic router), and `commit` (native pre-commit secret scan + `[T-xxxx]` commit).
- AC4: `bin/agentflow.js` and `tools/install.py` add `.agentflow/scripts/__pycache__/` and `*.pyc` to `.gitignore`, make `.git/hooks/` opt-in via `--hooks`, and update skill/command docs and `README.md`.
- AC5: Verified end-to-end in `task-943` (exit 0) and validated via `tools/validate.py`.
