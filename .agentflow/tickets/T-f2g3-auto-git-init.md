---
type: ticket
id: T-f2g3-auto-git-init
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T172716Z
actor: agent
role: agent
lane: standard
priority: must
size: S
mvp: MVP-1
title: Automatically initialize git repository on init, install, and /af-start
req_links:
  - REQ-m7n8-eval-runs
effort_budget:
  steps: 4
  retries: 0
  est_minutes: 15
  approx_tokens: "~8k (approximate)"
---
# Story

As a developer starting a new application with Agentflow, I want `agentflow init`, `install`, and `/af-start` to automatically initialize a git repository (when one does not already exist) and guide the initial baseline commit, so git baselines, diffs, branches, and revert safety work immediately out of the box.

## Acceptance Criteria
- AC1: `bin/agentflow.js` (`install` / `init`) and `tools/install.py` run `git init -b main` (fallback `git init`) when `<target>` is not already inside a git repository, skip safely when already inside a git repo, and support `--dry-run`.
- AC2: `bin/agentflow.js doctor` checks git repository initialization status.
- AC3: `src/commands/af-start.md`, `src/skills/git-workflow/SKILL.md`, and `README.md` ensure git initialization during `/af-start` and establish a clean initial baseline commit (`HEAD`) safely after `.gitignore` verification.
- AC4: Tested in an isolated non-git scratch folder (`git init` runs, `doctor` reports git ready, re-run skips cleanly) and `tools/validate.py` passes.
