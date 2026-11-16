---
type: ticket
id: T-c3d4-compat-matrix
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261116T182611Z
actor: agent
role: agent
lane: standard
priority: should
size: S
title: Fill the dated compatibility matrix from verified runs
req_links:
  - REQ-p9qv-compat-matrix
---
# Story
As a framework user, I want a compatibility matrix with verified/unverified cells, so that I know which features actually work in my agent before relying on them.

## Acceptance Criteria
- AC1: Given eval runs are complete, then every agent×feature cell is marked verified (with date and evidence ref) or unverified.
- AC2: Given any unverified cell, then no doc claims that feature works for that agent.

## Verification Methods
- AC1: document-review
- AC2: document-review

## Test Plan
- Own tests: manual inspection against eval evidence
- Regression set: python tools/validate.py .
- Manifest mapping: evals/RUN-EVALS.md + docs/adapter-guide.md updates

## Notes
- Depends on: T-a1b2-eval-runs (results feed the matrix).
