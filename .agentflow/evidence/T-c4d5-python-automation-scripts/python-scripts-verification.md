---
type: evidence
id: EV-k2m3-python-scripts
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T174628Z
actor: agent
role: agent
ticket_id: T-c4d5-python-automation-scripts
source_command: node bin/agentflow.js init <scratch> ; python af_records.py ; python af_test_runner.py ; python af_gate_runner.py ; python tools/validate.py <scratch>
truncated: false
---

# Evidence: T-c4d5-python-automation-scripts

End-to-end verification in isolated scratch project (`task-851`):
- `node bin/agentflow.js init`: installed `.agentflow/scripts/*.py`, set `owner: GurunathJadhav`, `Doctor: ALL CLEAR`.
- `af_records.py req`, `decision` (`approved_by=GurunathJadhav`), `ticket`, `plan --sa1`, `start` all succeeded and generated schema-compliant Markdown + events.
- `af_gate_runner.py advance-gate --to implementation`: checked gate, approved by `GurunathJadhav`, auto-generated `BUILD-BRIEF.md`, `BUILD-PROMPT.txt`, and `report.html`.
- `af_test_runner.py scaffold` + `verify`: generated `tests/todo.test.mjs`, captured command output into `evidence/`, wrote passing `V-*`.
- `af_gate_runner.py close-ticket`: logged `ticket-done` (`actual_min=12`, `actual_tokens=~6k`), locked `edit_lock`, refreshed `report.html` (`1/1 MVPs`, `6.0k tokens`) and `BUILD-BRIEF.md`.
- `tools/validate.py <scratch>`: scanned 18 generated record files, **PASS (exit 0)**.
