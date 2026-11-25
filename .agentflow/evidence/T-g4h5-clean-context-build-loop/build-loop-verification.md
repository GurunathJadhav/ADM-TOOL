---
type: evidence
id: EV-r4s5-clean-build-loop
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T173402Z
actor: agent
role: agent
ticket_id: T-g4h5-clean-context-build-loop
source_command: node --check tools/agentflow-build.js ; node bin/agentflow.js build evals/golden-project ; node bin/agentflow.js init <scratch>
truncated: false
---

# Evidence: T-g4h5-clean-context-build-loop

- `AGENTS.md`: 38 lines (under 60-line §S18 cap)
- `node --check bin/agentflow.js` and `node --check tools/agentflow-build.js`: exit 0
- `node bin/agentflow.js build evals/golden-project`: Generated 2,501-byte `BUILD-BRIEF.md` and `BUILD-PROMPT.txt` targeting `T-p3rn-list-tasks` and `T-w9vt-complete-task` with context-hygiene and loop instructions.
- `node bin/agentflow.js init <scratch>`: `55 command files, 37 skills installed, 92 Antigravity skills (.agents/skills/)`, `.agentflow/build.js present`, `.agentflow/report.js present`, `.agentflow/report.html present`, `git repository initialized`, `Doctor: ALL CLEAR`.
- Standalone `node <scratch>/.agentflow/build.js` executed cleanly.
