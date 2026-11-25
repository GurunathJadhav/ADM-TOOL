---
type: ticket
id: T-m9n2-ergonomics-and-craft
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T132100Z
actor: agent
role: agent
lane: standard
priority: must
size: M
title: Overhaul agent workflow speed, UI/UX craft standards, runtime verification, and CLI parity
req_links:
  - REQ-m7n8-eval-runs
---
# Story

As a developer using Agentflow with an AI coding agent, I want fast mode presets (`rapid` / `balanced` / `strict`), cohesive UI/UX craft guidelines, slice-level live runtime verification instead of 1-file paperwork bottlenecks, and working Antigravity/CLI integration — so that simple apps (like a Todo app) are built quickly, look polished, and work without bugs.

## Acceptance Criteria
- AC1: `src/init/project.md`, `gates.md`, `lanes.md`, `workflow-map.md`, and `af-start.md` support workflow presets (`rapid`, `balanced` default, `strict`), slice-level editing in `rapid`/`balanced` (not 1-file halt), expanded S/M budgets, and streamlined solo review without stalling on external reviewers.
- AC2: New skill `src/skills/frontend-and-ui-craft/SKILL.md` exists and `src/profiles/web-app/PROFILE.md` + `src/skills/lean-architecture/SKILL.md` + `src/skills/using-agentflow/SKILL.md` mandate polished design tokens, responsive layout, empty/loading/error/interactive states, and clarify that lean architecture never means bare/unstyled UI.
- AC3: `src/commands/af-verify.md`, `af-edit-plan.md`, `af-start-ticket.md`, `af-review.md`, `af-done.md`, and `src/skills/tdd-implementation/SKILL.md` support vertical-slice edits and mandate real runtime/smoke verification (build + tests + live render/interaction/console-error check) before closing UI/app tickets.
- AC4: `src/adapters/AGENTS.md` (<=60 lines), `src/adapters/antigravity.md`, and repo `AGENTS.md` reflect the streamlined, craft-focused instructions cleanly.
- AC5: `bin/agentflow.js` mirrors `/af-*` commands and skills into `.agents/skills/` (non-destructively), exposes `validate`, removes dead hardcoded paths in `tools/agentflow-loop.js`, `tools/validate.py` handles slugged/short ticket IDs + preset modes, and `README.md` documents the current CLI accurately.
- AC6: `node bin/agentflow.js init <temp-dir>` installs `.agentflow/`, `.agents/skills/af-start/SKILL.md`, `AGENTS.md`, `CLAUDE.md`, passes `doctor`, and `python tools/validate.py .` passes with exit 0.

## Verification Methods
- AC1–AC5: file-inspection + static-check
- AC6: command-output (`node bin/agentflow.js init`, `doctor`, `validate.py .`)

## Test Plan
- Own tests: temp-dir `init`, `doctor`, `validate` checks; Antigravity `.agents/skills/` check; JS syntax checks (`node --check`)
- Regression set: `python tools/validate.py .` PASS (exit 0) and `python tools/validate.py evals/golden-project`
