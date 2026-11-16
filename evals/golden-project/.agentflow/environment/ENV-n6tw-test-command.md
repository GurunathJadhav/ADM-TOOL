---
type: environment
id: ENV-n6tw-test-command
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261109T093000Z
actor: agentflow-worker
role: agent
fact_name: test_command
value: "python -m pytest tests/ -q (own tests: append the specific test file)"
label: verified
evidence_ref: V-2mck-bootstrap-tests
---

# Environment fact: default test and regression commands

The bootstrap ticket (T-7h2j-bootstrap) established the default test command
and the regression set. Lint: `python -m ruff check src tests`. All commands
owner-approved once and recorded here (safety.md allowlist).
