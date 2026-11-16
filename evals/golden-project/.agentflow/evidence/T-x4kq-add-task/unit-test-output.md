---
type: evidence
id: E-3bdf-add-task-tests
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261109T124500Z
actor: agentflow-worker
role: agent
ticket_id: T-x4kq-add-task
source_command: python -m pytest tests/ -q
exit_code: 0
truncated: false
---

# Evidence: add-task unit + regression run

Executed At: 20261109T124500Z · Exit Code: 0

## Raw output
```text
============================= test session starts =============================
platform win32 -- Python 3.12.7, pytest-8.3.4
rootdir: ...evals\golden-project
collected 7 items

tests/test_bootstrap.py ..                                                [ 28%]
tests/test_add.py .....                                                   [100%]

============================== 7 passed in 0.41s ==============================
```
