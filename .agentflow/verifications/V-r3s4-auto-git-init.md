---
type: verification
id: V-r3s4-auto-git-init
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T172905Z
actor: agent
role: implementer
ticket_id: T-f2g3-auto-git-init
method: command-output
result: pass
evidence_ref: .agentflow/evidence/T-f2g3-auto-git-init/git-init-verification.md
---
# Verification: T-f2g3-auto-git-init

All ACs pass:
- AC1: `bin/agentflow.js` and `tools/install.py` automatically run `git init -b main` when not inside an existing git repository, skip safely if inside a parent repo or existing `.git`, and obey `--dry-run`.
- AC2: `bin/agentflow.js doctor` verifies git repository status.
- AC3: `af-start.md`, `git-workflow/SKILL.md`, and `README.md` ensure git init + baseline commit setup at `/af-start`.
- AC4: Isolated scratch install/re-run checks pass.
