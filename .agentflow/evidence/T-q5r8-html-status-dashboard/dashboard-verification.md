---
type: evidence
id: EV-d6e7-html-dashboard
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T172530Z
actor: agent
role: agent
ticket_id: T-q5r8-html-status-dashboard
source_command: node --check ; node bin/agentflow.js report . ; node bin/agentflow.js report evals/golden-project ; node bin/agentflow.js init test-report-init
truncated: false
---

# Evidence: T-q5r8-html-status-dashboard

- `AGENTS.md`: 38 lines (under 60-line §S18 cap)
- `node --check bin/agentflow.js` and `tools/agentflow-report.js`: exit 0
- `node bin/agentflow.js report .`: Generated `.agentflow/report.html` (`Tickets: 9 (6 done) | MVPs: 0/2 | Est: 460m | Actual: 264m`)
- `node bin/agentflow.js report evals/golden-project`: Generated 37,208-byte HTML (`Tickets: 5 (2 done) | MVPs: 0/2 | Est: 125m | Actual: 165m`), contains SVG donut charts, grouped bar charts, and MVP wave metrics.
- `node bin/agentflow.js init test-report-init`: `54 command files, 36 skills installed, 90 Antigravity skills (.agents/skills/)`, `.agentflow/report.js present`, `.agentflow/report.html present`, `Doctor: ALL CLEAR`.
- Standalone `node test-report-init/.agentflow/report.js` with zero arguments regenerated `report.html` cleanly.
