---
type: evidence
id: EV-v2w3-full-auto
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T175755Z
actor: agent
role: agent
ticket_id: T-k3m4-full-python-cli-automation
source_command: node bin/agentflow.js init <scratch> + doctor + env-probe + req --batch-stdin + coverage + next + plan + start + diff-check + smoke + report + build + ticket-done + commit + validate.py
truncated: false
---

# Evidence: T-k3m4-full-python-cli-automation

- Scratch end-to-end verification (`task-943`) exited `0`:
  - `node bin/agentflow.js init <scratch>` installed `.agentflow/scripts/*.py`, initialized git repository, resolved GitHub owner `GurunathJadhav`, and passed `doctor`: `ALL CLEAR — framework is correctly installed.`
  - `node bin/agentflow.js install <scratch> --dry-run --hooks` staged `\.git\hooks\pre-commit` and `\.git\hooks\commit-msg` only when `--hooks` is explicitly requested (opt-in so Windows sandboxed commits stay reliable).
  - `af_records.py env-probe`: wrote `environment/runtime.md` (`ENV-jbk0-runtime`, `OS=Windows Node=v22.12.0 Python=Python 3.13.9 PkgMgr=npm`, detected `package.json` `test` & `build` scripts).
  - `af_records.py req --batch-stdin`: created `REQ-85y5-filter-tasks.md` and `REQ-d08f-add-task.md`.
  - `af_gate_runner.py coverage`: `{"coverage_pct": 100, "uncovered_reqs": [], "orphan_tickets": [], "passed": true}`.
  - `af_gate_runner.py next`: `{"phase": "discovery", "next_command": "/af-gate", "open_failures": []}`.
  - `af_records.py plan` + `start`: created manifest `M-ktsm-csce-plan`, SA1 approval `A-0fpn-sa1-csce`, baseline `BL-w5xe-csce`, and unlocked `edit_lock`.
  - `af_test_runner.py diff-check`: `{"verification": "V-18dx-diff-check", "result": "pass", "off_manifest": [], "issues": []}`.
  - `af_test_runner.py smoke --check-file index.html --exec "node -e console.log(123)"`: `{"verification": "V-gmmd-smoke", "result": "pass", "evidence": ".agentflow/evidence/T-csce-add-task-ui/smoke.md"}`.
  - `report.js` & `build.js`: generated `.agentflow/report.html`, `BUILD-BRIEF.md`, and `BUILD-PROMPT.txt`.
  - `af_gate_runner.py ticket-done` + `commit`: closed `T-csce-add-task-ui` (`E-m30t-done`, `edit_lock: locked`) and created commit `1d9b7cd` (`[T-csce-add-task-ui] Add task UI`).
  - `tools/validate.py <scratch>`: `scanned 24 record files for frontmatter and schema compliance`, `result: PASS with warnings (exit 0)`.
