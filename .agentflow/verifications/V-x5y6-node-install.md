---
type: verification
id: V-x5y6-node-install
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261121T093200Z
actor: agent
role: agent
ticket_id: T-d4e5-node-install-loop
criterion_id: AC1-AC4
method: command-output
result: pass
evidence_ref: reviews/R-r6t7-node-install.md
---
# Verification: Node.js/npx CLI with question loop and no-coding gate

- AC1: package.json bin field → bin/agentflow.js; `npx github:GurunathJadhav/ADM-TOOL install <project>` resolves and runs.
- AC2: agentflow-loop.js scans .agentflow/questions/ for blocking unanswered questions, prompts one at a time, records verbatim answers + answer events, repeats until zero open.
- AC3: agentflow-gate.js refuses (exit 1) when open blocking questions / unbaselined requirements exist, unless --skip-questions.
- AC4: Validator PASS on repo (59 records) and golden fixture (56 records); no Python installer/validator behavior changed.
