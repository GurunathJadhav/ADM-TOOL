---
type: blocker
id: B-5wqj-terminal-colours
project_id: af-prj-9001
schema_version: 1.0.0
created: 20261110T091500Z
actor: agentflow-worker
role: agent
blocker_type: human
ticket_id: T-p3rn-list-tasks
owner: owner
needed_by: 20261113
---

# Human blocker: colour decision for list output

Only the owner can supply this: may `list` colour the ids/status (would add
`colorama` — runtime dep, needs supply-chain vetting + approval), or stay
plain? Blocks only the polish step of T-p3rn-list-tasks; core criteria proceed
unblocked. Dependent work: criterion 3 refinement. Raised via `/af-blockers`;
STATE.md lists it in Open Blockers.
