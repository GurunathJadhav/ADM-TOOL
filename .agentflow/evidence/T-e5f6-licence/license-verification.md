---
type: evidence
id: E-j5k6-license-check
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T154630Z
actor: agent
role: agent
ticket_id: T-e5f6-licence
source_command: Test-Path LICENSE + python tools/validate.py .
truncated: false
---

# Verification evidence: licence file and validator state

```
LICENSE exists: True

Copyright (c) 2026 Agentflow Project
result: PASS (exit 0)              # validator on .agentflow/ after approval record fix
result: PASS (exit 0)              # validator on evals/golden-project
```

Also confirmed: `evals/golden-project-previous` no longer exists after owner-approved deletion.
