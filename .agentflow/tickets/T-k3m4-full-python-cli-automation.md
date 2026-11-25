---
type: ticket
id: T-k3m4-full-python-cli-automation
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T175116Z
actor: agent
role: agent
lane: standard
priority: must
size: M
mvp: MVP-1
title: Add full Python automation for env-probe, coverage, diff-check, next router, live smoke, commit, batch req, and git hooks
req_links:
  - REQ-m7n8-eval-runs
effort_budget:
  steps: 6
  retries: 0
  est_minutes: 35
  approx_tokens: "~20k (approximate)"
---
# Story

As a developer using Agentflow with AI agents, I want Python scripts to handle environment probing (`env-probe`), bidirectional coverage/traceability (`coverage`), manifest diff/hygiene checks (`diff-check`), deterministic `/af-next` routing (`next`), live server/UI smoke checks (`smoke`), ticket commits (`commit`), batch requirements (`req --batch-stdin`), and automatic Tier-2 Git hooks installation — so AI token consumption stays minimal across the entire lifecycle.

## Acceptance Criteria
- AC1: `af_records.py` adds `env-probe` (writes `environment/runtime.md`, `environment.md`, event) and `req --batch-stdin` (batch create requirements).
- AC2: `af_test_runner.py` adds `diff-check` (checks `git diff` vs active manifest + scans for secrets/`debugger`/`pdb`, writes `V-*-diff-check.md` + `evidence/`) and `smoke` (optional `--start`, HTTP `--url` probe, optional Playwright console error check, clean process teardown, writes `V-*-smoke.md` + `evidence/`).
- AC3: `af_gate_runner.py` adds `coverage` (audits REQ↔Ticket coverage, writes `traceability.md`, logs `coverage-verified`), `next` (deterministic next-command router without loading 29KB `workflow-map.md`), and `commit` (stages & commits `[T-xxxx] ...` cleanly with optional `--branch`).
- AC4: `bin/agentflow.js` and `tools/install.py` install `tools/hooks/pre-commit` and `commit-msg` into `.git/hooks/` non-destructively (with `--no-hooks` opt-out); `src/skills/python-script-automation/SKILL.md`, `af-env.md`, `af-coverage.md`, `af-diff-check.md`, `af-next.md`, and `README.md` are updated cleanly.
- AC5: Verified all new subcommands + git hooks + live smoke test + `tools/validate.py` passing exit 0.
