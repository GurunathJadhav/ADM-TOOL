---
type: evidence
id: EV-t8v9-overhaul-verif
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T132956Z
actor: agent
role: agent
ticket_id: T-m9n2-ergonomics-and-craft
source_command: node --check ; node bin/agentflow.js init test-init-verify ; python tools/validate.py evals/golden-project
truncated: false
---

# Evidence: T-m9n2-ergonomics-and-craft

## 1. Adapter Line-Count & JS Syntax Checks
- `AGENTS.md`: 37 lines (under 60-line §S18 cap)
- `src/adapters/AGENTS.md`: 37 lines (under 60-line §S18 cap)
- `node --check bin/agentflow.js`: exit 0
- `node --check tools/agentflow-loop.js`: exit 0
- `node --check tools/agentflow-gate.js`: exit 0

## 2. Full `init` End-to-End Test (temp directory `test-init-verify`)
- Command: `node bin/agentflow.js init test-init-verify`
- Output highlights:
  - `54 command files, 35 skills installed, 89 Antigravity skills (.agents/skills/)`
  - `Agentflow gate: CLEAR — no open blocking questions, all requirements baselined, manifests closed.`
  - `Doctor: ALL CLEAR — framework is correctly installed.`
  - `.agents/skills/af-start/SKILL.md`: True
  - `.agents/skills/frontend-and-ui-craft/SKILL.md`: True
  - `.agentflow/project.md` strictness: `strictness: balanced`

## 3. Validator Verification
- `python tools/validate.py evals/golden-project`: PASS (exit 0)
