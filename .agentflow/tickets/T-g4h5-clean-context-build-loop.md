---
type: ticket
id: T-g4h5-clean-context-build-loop
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T173101Z
actor: agent
role: agent
lane: standard
priority: must
size: M
mvp: MVP-1
title: Add clean-context BUILD-BRIEF generator, /af-build loop command, and fresh-session handoff
req_links:
  - REQ-m7n8-eval-runs
effort_budget:
  steps: 6
  retries: 0
  est_minutes: 30
  approx_tokens: "~18k (approximate)"
---
# Story

As a developer using Agentflow, I want a zero-bloat build context brief (`.agentflow/BUILD-BRIEF.md`) and a single `agentflow build` / `/af-build` loop command once planning finishes, so I can launch a brand-new clean AI session without discovery/Q&A context pollution and build tickets in a disciplined loop.

## Acceptance Criteria
- AC1: `tools/agentflow-build.js` builds `.agentflow/BUILD-BRIEF.md` (distilled requirements, ADRs, environment build/test/smoke commands, ordered MVP ticket queue) and `.agentflow/BUILD-PROMPT.txt` (copy-pasteable fresh-session loop prompt) cleanly from `.agentflow/` records with zero external dependencies.
- AC2: `bin/agentflow.js` installs `tools/agentflow-build.js` → `.agentflow/build.js` on `init`/`install` (and `tools/install.py` matches), exposes `agentflow build <project> [--batch=N] [--ticket=T-...]`, and checks `.agentflow/build.js` in `doctor`.
- AC3: New command `src/commands/af-build.md` (mirrored to `.agents/skills/af-build/SKILL.md` on install) and new skill `src/skills/clean-context-build-loop/SKILL.md` define the fresh-session loop and anti-context-pollution reading discipline.
- AC4: `src/commands/af-gate.md`, `src/commands/af-handoff.md`, `src/skills/session-handoff-resume/SKILL.md`, `src/init/workflow-map.md`, `src/init/CHEATSHEET.md`, `src/adapters/AGENTS.md` (<=60 lines), `AGENTS.md`, and `README.md` wire `/af-build` cleanly at the Planning → Implementation handoff.
- AC5: Verified `node bin/agentflow.js build` on both `ADM-Tool` and `evals/golden-project` + fresh `init` temp project; `tools/validate.py` passes cleanly.
