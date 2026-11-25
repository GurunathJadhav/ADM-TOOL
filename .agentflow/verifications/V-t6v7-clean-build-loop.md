---
type: verification
id: V-t6v7-clean-build-loop
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T173402Z
actor: agent
role: implementer
ticket_id: T-g4h5-clean-context-build-loop
method: command-output
result: pass
evidence_ref: .agentflow/evidence/T-g4h5-clean-context-build-loop/build-loop-verification.md
---
# Verification: T-g4h5-clean-context-build-loop

All ACs pass:
- AC1: `tools/agentflow-build.js` compiles compact `.agentflow/BUILD-BRIEF.md` and `.agentflow/BUILD-PROMPT.txt` from `.agentflow/` records.
- AC2: `bin/agentflow.js` and `tools/install.py` install `.agentflow/build.js`, `agentflow build` runs cleanly, and `doctor` checks `build.js`.
- AC3: `src/commands/af-build.md` and `src/skills/clean-context-build-loop/SKILL.md` exist and mirror to `.agents/skills/`.
- AC4: `af-gate.md`, `af-handoff.md`, `session-handoff-resume/SKILL.md`, `workflow-map.md`, `CHEATSHEET.md`, `AGENTS.md`, and `README.md` updated cleanly.
- AC5: Verified on `evals/golden-project`, fresh `init`, and `validate.py`.
