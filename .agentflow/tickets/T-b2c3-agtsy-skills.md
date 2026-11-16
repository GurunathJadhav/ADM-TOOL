---
type: ticket
id: T-b2c3-agtsy-skills
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T180000Z
actor: agent
role: agent
lane: standard
priority: must
size: S
title: Expose /af-* commands as native Antigravity skills
req_links:
  - REQ-m7n8-eval-runs
---
# Story
As a framework user on Antigravity (CLI and IDE), I want `/af-*` slash commands to appear natively, so that I can drive the framework without workarounds.

## Acceptance Criteria
- AC1: Given the installer runs, then each command in `.agentflow/commands/af-<name>.md` is also copied to `.agents/skills/af-<name>/SKILL.md` (front matter name/description preserved), non-destructively.
- AC2: Given a re-run of the installer, then existing `.agents/skills/` files are skipped, not overwritten.
- AC3: Given the Antigravity docs mechanism (skills auto-convert to slash commands; `/skills reload` refreshes), then the adapter guide documents this with the verification date.
- AC4: Given a fresh temp install, then `.agents/skills/af-start/SKILL.md` exists with valid front matter, and the repo validator still PASSes.

## Verification Methods
- AC1–AC4: command-output (fresh temp install + file checks + validator)

## Test Plan
- Own tests: temp-dir install, dry-run, idempotent re-run, front-matter check
- Regression set: python tools/validate.py .
- Manifest mapping: tools/install.py, docs/adapter-guide.md, .agents/skills/** (in target projects)

## Notes
- Verified mechanism: Antigravity docs /docs/skills (fetched 2026-11-17): CLI auto-converts skills in `.agents/skills/` to slash commands; App invokes via `/<skill-name>`; IDE reads same workspace path.
