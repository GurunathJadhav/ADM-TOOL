---
type: environment
id: ENV-k8mx-pytest-version
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261109T093000Z
actor: agentflow-worker
role: agent
fact_name: pytest_version
value: 8.3.4 (dev dependency, MIT licence)
label: verified
evidence_ref: evidence/environment/python-version-check.md
---

# Environment fact: pytest 8.3.4 installed

Verified via `python -m pytest --version`. Added after the supply-chain
checklist (registry existence, licence, age) and owner confirmation of
Q-m7qs-auto-tests.
