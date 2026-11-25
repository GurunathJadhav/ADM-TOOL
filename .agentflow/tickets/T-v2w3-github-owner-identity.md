---
type: ticket
id: T-v2w3-github-owner-identity
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T173700Z
actor: agent
role: agent
lane: standard
priority: must
size: M
mvp: MVP-1
title: Use current GitHub username as project owner and replace generic "owner" in decision and confirmation records
req_links:
  - REQ-m7n8-eval-runs
effort_budget:
  steps: 5
  retries: 0
  est_minutes: 25
  approx_tokens: "~14k (approximate)"
---
# Story

As a developer using Agentflow, I want the installer and agent instructions to automatically resolve my current GitHub username as the project `owner` (never leaving `<owner-name>` or writing generic `"owner"` in decision, approval, or confirmation files), so every record clearly identifies the actual author/approver.

## Acceptance Criteria
- AC1: `bin/agentflow.js` and `tools/install.py` detect the current GitHub username (`gh api user -q .login` -> `git config github.user` -> git `origin` owner -> `git config user.name` -> OS user) and populate `owner:`, `approvers:`, `reviewers:`, and `name:` in `.agentflow/project.md` on install/init.
- AC2: `bin/agentflow.js doctor` verifies `owner` is populated (no `<owner-name>` placeholder).
- AC3: `src/templates/decision.md`, `src/templates/approval.md`, and commands (`af-start.md`, `af-decide.md`, `af-confirm-understanding.md`, `af-gate.md`, `af-accept.md`, `af-glossary.md`, `af-edit-plan.md`, `af-approvals.md`) explicitly forbid writing literal `"owner"` or `"<owner-name>"` in decision/confirmation/approval records and require using the GitHub username from `project.md`.
- AC4: `tools/agentflow-loop.js`, `tools/agentflow-build.js`, `tools/agentflow-report.js`, and `.agentflow/project.md` use the resolved GitHub username cleanly.
- AC5: Verified on fresh scratch `init` + `doctor` + `validate.py` passing exit 0.
