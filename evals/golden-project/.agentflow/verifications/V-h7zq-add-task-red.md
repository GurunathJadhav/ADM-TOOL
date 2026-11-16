---
type: verification
id: V-h7zq-add-task-red
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261109T120000Z
actor: agentflow-worker
role: agent
ticket_id: T-x4kq-add-task
method: automated-test
command: python -m pytest tests/test_add.py -q
result: fail
evidence_ref: none
---

# Verification (expected red): add-task criteria not implemented

TDD red step: new tests fail before any source edit (S5.3). Output:
`2 failed, 0 passed` — `test_add_creates_task`, `test_add_sequential_ids`.
A test never seen failing is not evidence; this red run is what makes the
later green run (V-s5pw) count.
