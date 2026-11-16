---
type: verification
id: V-s5t6-cleanup-git
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T170100Z
actor: agent
role: agent
ticket_id: T-c5d6-cleanup-git
criterion_id: AC1-AC4
method: command-output
result: pass
evidence_ref: evidence/T-c5d6-cleanup-git/cleanup-verification.md
---
# Verification: cleanup + git init

- AC1: 0 temp install-test dirs remain (was 3).
- AC2: `evals/_gen_golden.py` removed; golden fixture still validates PASS.
- AC1b/extra: `evals/scale/`, `evals/state-fixtures/`, `evals/scenarios/bad-behaviour/`,
  `evals/scenarios/wrong-command/`, `tools/validate.mjs|ps1|sh`, `tools/__pycache__/` removed.
- AC3: git repo initialised; commits `4f41974` (initial) and `2022dbc` (cleanup); clean status.
- AC4: validator PASS on `.` (after manifest field fix) and on golden fixture.
