---
type: ticket
id: T-c5d6-cleanup-git
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T163000Z
actor: agent
role: agent
lane: standard
priority: must
size: S
title: Remove test artifacts and initialise git for publishing
req_links:
  - REQ-t2w3-licence-decision
---
# Story
As the owner, I want disposable test artifacts removed and the repo under git, so that only the framework is pushed.

## Acceptance Criteria
- AC1: Given temp install-test directories exist in %TEMP%, when cleaned, then none remain.
- AC2: Given evals/_gen_golden.py is a build helper, when removed, then the golden fixture still validates PASS.
- AC3: Given git init + initial commit run, then the repo is a valid git repository with a clean first commit containing the framework.
- AC4: Given the changes, then python tools/validate.py . still PASSes.

## Verification Methods
- AC1–AC4: command-output

## Test Plan
- Own tests: dir-absence checks, git status, validator runs
- Regression set: python tools/validate.py .
- Manifest mapping: no framework source files touched
