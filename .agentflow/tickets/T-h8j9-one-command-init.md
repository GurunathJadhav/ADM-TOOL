---
type: ticket
id: T-h8j9-one-command-init
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261121T160000Z
actor: agent
role: agent
lane: standard
priority: must
size: M
title: Single init command combining install + loop + doctor
req_links:
  - T-d4e5-node-install-loop
---
# Story

As a developer, I want one command (`agentflow init <project>`) that installs the framework, runs the question loop until all blocking questions are answered, and confirms the pre-edit gate is clear — so I don't have to run three separate commands.

## Acceptance Criteria
- AC1: `agentflow init <project>` runs install → loop → doctor sequentially and stops if any step fails.
- AC2: If install finds the project already has `.agentflow/`, init skips install and proceeds to loop.
- AC3: If loop finds no open blocking questions, init proceeds directly to doctor.
- AC4: If doctor is blocked, init exits non-zero and tells the user to run `agentflow loop` then `agentflow doctor`.
- AC5: Validator still PASSes after the change.

## Verification Methods
- AC1–AC4: command-output (fresh temp init runs)
- AC5: command-output (`python tools/validate.py .`)

## Test Plan
- Own tests: temp-dir init run with simulated answers, second init run on same project (skip install)
- Regression set: `python tools/validate.py .` PASS

## Notes
- Builds on existing install.py, agentflow-loop.js, agentflow-gate.js — no new logic, just orchestration.
