---
type: evidence
id: EV-p9q2-auto-git-init
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T172905Z
actor: agent
role: agent
ticket_id: T-f2g3-auto-git-init
source_command: node --check bin/agentflow.js ; node bin/agentflow.js init <scratch> --dry-run ; node bin/agentflow.js init <scratch>
truncated: false
---

# Evidence: T-f2g3-auto-git-init

Tested on isolated non-git scratch folder (`scratch/test-git-app`):
- `node --check bin/agentflow.js`: exit 0
- `init --dry-run`: logged `[dry-run] git init -b main` without writing `.git`
- `init`: created `.git/` (`.git exists: True`), doctor reported `✓ git repository initialized` and `Doctor: ALL CLEAR`
- Second `init` on same folder: logged `skip (exists): .git repository already initialized`
