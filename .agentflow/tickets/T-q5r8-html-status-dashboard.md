---
type: ticket
id: T-q5r8-html-status-dashboard
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T172057Z
actor: agent
role: agent
lane: standard
priority: must
size: M
title: Add live HTML Project Status Dashboard skill, generator, charts, and auto-install wiring
req_links:
  - REQ-m7n8-eval-runs
---
# Story

As a developer building applications with Agentflow, I want a built-in skill and zero-dependency generator that automatically installs and maintains a modern interactive `.agentflow/report.html` dashboard tracking MVPs, user stories, timings (estimated vs actual), token consumption, quality gates, and SVG pie/bar charts — so I always have clear visual project telemetry.

## Acceptance Criteria
- AC1: `tools/agentflow-report.js` parses `.agentflow/` Markdown records (project, state, requirements, tickets, events, verifications, reviews, blockers, risks, waivers, questions) with zero external dependencies and writes a responsive, modern, theme-toggleable `.agentflow/report.html` with mathematically accurate inline SVG pie/donut charts, grouped/stacked bar charts, MVP & story progress, estimated vs actual timings, token consumption, quality gate coverage, and searchable ticket table.
- AC2: `bin/agentflow.js` copies `tools/agentflow-report.js` to `.agentflow/report.js` and generates initial `.agentflow/report.html` during `install`/`init`, exposes `agentflow report <project>`, and checks it in `doctor`.
- AC3: New skill `src/skills/project-status-dashboard/SKILL.md` exists and is mirrored into `.agents/skills/` on install.
- AC4: `src/templates/ticket.md`, `src/commands/af-ticket.md`, `src/commands/af-report.md`, `src/commands/af-done.md`, `src/commands/af-start.md`, `src/adapters/AGENTS.md` (<=60 lines), `AGENTS.md`, `tools/install.py`, and `README.md` are updated so agents record `mvp`/`est_minutes`/`actual_minutes`/`approx_tokens` and keep `.agentflow/report.html` updated automatically.
- AC5: Verified on both `ADM-Tool` itself and `evals/golden-project` + fresh `init` temp project; `tools/validate.py .` and `evals/golden-project` pass with exit 0.

## Verification Methods
- AC1–AC4: static-check (`node --check`), file-inspection
- AC5: command-output (`node bin/agentflow.js report`, `init`, `doctor`, `validate.py`)

## Test Plan
- Own tests: run `agentflow report .` and `agentflow report evals/golden-project`, verify SVG charts, metrics, timings, tokens, and MVP counts render cleanly in generated HTML; run fresh `agentflow init <temp>` and verify `.agentflow/report.js` + `.agentflow/report.html` + `.agents/skills/project-status-dashboard/SKILL.md` exist.
- Regression set: `python tools/validate.py .` PASS (exit 0) and `python tools/validate.py evals/golden-project` PASS (exit 0).
