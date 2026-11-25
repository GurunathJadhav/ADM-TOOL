---
type: evidence
id: EV-f4g5-github-owner
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261125T174031Z
actor: agent
role: agent
ticket_id: T-v2w3-github-owner-identity
source_command: node --check ; node bin/agentflow.js init <scratch-origin> ; node bin/agentflow.js report .
truncated: false
---

# Evidence: T-v2w3-github-owner-identity

- `node --check` passed on `bin/agentflow.js`, `tools/agentflow-loop.js`, `tools/agentflow-build.js`, `tools/agentflow-report.js`.
- Fresh scratch folder with GitHub `origin` remote: resolved `GurunathJadhav` into `project.md` (`owner:`, `approvers:`, `reviewers:`), `doctor` printed `✓ owner (GitHub): GurunathJadhav` and `ALL CLEAR`.
- Fresh scratch folder without `origin`: cleanly resolved `git config user.name` (`Gurunath Jadhav`), replacing `<owner-name>` placeholder automatically.
- `.agentflow/report.html` displays `GitHub: @GurunathJadhav`.
