---
type: ticket
id: T-c4d5-python-automation-scripts
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T174232Z
actor: agent
role: agent
lane: standard
priority: must
size: M
mvp: MVP-1
title: Add Python automation scripts for record/plan/test creation, verification execution, and gate checks
req_links:
  - REQ-m7n8-eval-runs
effort_budget:
  steps: 6
  retries: 0
  est_minutes: 35
  approx_tokens: "~20k (approximate)"
---
# Story

As a developer using Agentflow with AI agents, I want zero-dependency Python helper scripts installed into `.agentflow/scripts/` (handling record/ticket/manifest/decision creation, test file generation & execution with evidence capture, and gate evaluation/advancement), so AI agents supply short content arguments instead of wasting thousands of tokens rewriting Markdown templates and boilerplate.

## Acceptance Criteria
- AC1: `tools/scripts/af_records.py` generates valid Crockford-base32 IDs, compact UTC timestamps, and compliant records + events for `ticket`, `plan` (manifest), `start` (baseline + unlock), `req`, `question`, `decision`, `approval`, and `state-rebuild` using GitHub owner from `project.md` (single or JSON batch mode).
- AC2: `tools/scripts/af_test_runner.py` scaffolds test files from ticket acceptance criteria (`scaffold`) and runs commands with trimmed output saved to `.agentflow/evidence/` + `.agentflow/verifications/V-*.md` (`verify`).
- AC3: `tools/scripts/af_gate_runner.py` checks phase gates (`check-gate`), advances gates with GitHub user approval + `build.js` handoff (`advance-gate`), and closes tickets with `report.js` + `build.js` refresh (`close-ticket`).
- AC4: New skill `src/skills/python-script-automation/SKILL.md` created; `bin/agentflow.js` and `tools/install.py` copy `tools/scripts/*.py` into `.agentflow/scripts/`; `af-ticket.md`, `af-edit-plan.md`, `af-verify.md`, `af-gate.md`, `af-done.md`, `AGENTS.md`, and `README.md` reference the scripts.
- AC5: Verified running all 3 Python scripts end-to-end inside an isolated scratch project, and `tools/validate.py` passes exit 0 on both generated scratch records and repo.
