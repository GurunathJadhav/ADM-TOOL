---
type: ticket
id: T-e5f6-licence
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261116T182612Z
actor: agent
role: agent
lane: standard
priority: must
size: S
title: Owner chooses and records the framework licence
req_links:
  - REQ-t2w3-licence-decision
---
# Story
As the owner, I want to choose a licence, so that the framework can be published legally and reuse terms are explicit.

## Acceptance Criteria
- AC1: Given the owner states a licence choice, then a LICENSE file exists and a decision record D-<id>.md records it (two-way decision).
- AC2: Given attribution is owed for inspiration sources, then attribution is recorded or explicitly declared none.

## Verification Methods
- AC1: document-review + user-confirmation (owner's verbatim words in the approval record)
- AC2: document-review

## Test Plan
- Own tests: file presence check
- Regression set: python tools/validate.py .
- Manifest mapping: LICENSE, .agentflow/decisions/

## Notes
- Blocked on human decision — see B-k5m6 and question Q-n7p8.
