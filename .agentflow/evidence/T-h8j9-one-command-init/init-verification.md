---
type: evidence
id: EV-m4n5-init-verif
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261121T173723Z
actor: agent
role: agent
ticket_id: T-h8j9-one-command-init
source_command: node bin/agentflow.js init <temp> ; node bin/agentflow.js help
truncated: false
---

# Evidence: T-h8j9-one-command-init

Captured verification output for `bin/agentflow.js init`, `doctor`, and `loop` subcommands:

- `node bin/agentflow.js help` -> exit 0
- `node bin/agentflow.js init <temp> --dry-run` -> exit 0
- `node bin/agentflow.js init <temp>` -> Doctor: ALL CLEAR, exit 0
- `node bin/agentflow.js init <existing>` -> skips install cleanly, exit 0
