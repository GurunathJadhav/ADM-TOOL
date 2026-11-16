---
type: ticket
id: T-a1b2-eval-runs
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261116T182610Z
actor: agent
role: agent
lane: standard
priority: must
size: M
title: Run the eval suite with real agents and report pass rates
req_links:
  - REQ-m7n8-eval-runs
---
# Story
As a framework owner, I want the eval suite executed against real agents, so that enforcement claims are evidence-based rather than aspirational.

## Acceptance Criteria
- AC1: Given the scenario files in evals/scenarios/, when each is run ≥3 times per agent, then a dated pass-rate report exists with grader identity recorded.
- AC2: Given at least two agents are tested including one weaker model, then results are reported per agent and model size.
- AC3: Given a Tier 0 chat-only flow is tested, then its results appear in the same report.
- AC4: Given a weak model fails to follow a rule, then the failing rule is flagged for simplification (shorter skill, more examples) rather than more text.
- AC5: Given the golden project walkthrough, then it completes using only recommended commands.

## Verification Methods
- AC1–AC3: document-review (report file inspection by owner)
- AC4: document-review
- AC5: command-output (walkthrough transcript)

## Test Plan
- Own tests: manual eval runs (no automated suite; grader applies pass criteria)
- Regression set: python tools/validate.py . passes after every eval artefact is committed
- Manifest mapping: evals/** → this ticket's review; tools/validate.py unchanged

## Notes
- Depends on eval files (in progress, background build).
- Effort budget: 6 agent-hours equivalent (approximate, agent estimate).
