---
type: decision
id: D-i9j0-licence-mit
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T154500Z
actor: agent
role: agent
title: Publish Agentflow under the MIT licence
decision_type: two-way
status: approved
supersedes: none
---
# Decision: MIT licence

## Context
S18 requires a stated licence before distribution. The framework is distributed as a
copy-in template/skill pack, so reuse terms must permit bundling into arbitrary projects.

## Options considered
- **MIT** (recommended default in Q-n7p8): shortest, maximally permissive, matches template-pack reuse.
- **Apache-2.0**: adds an explicit patent grant and NOTICE requirements; more friction for a docs pack.
- **Proprietary/unpublished**: blocks the reuse model the framework is designed for.

## Decision
MIT, per the owner's selection on 2026-11-17 (see approval A-k1m3-licence-fixture for the verbatim record).

## Consequences
- `LICENSE` file added; redistribution must keep the notice.
- Two-way decision: reversible by a future owner decision (new D record), low exit cost.
- Attribution duty remains: no copied third-party text; inspiration sources recorded only where real.
