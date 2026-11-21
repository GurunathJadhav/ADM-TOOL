---
type: ticket
id: T-d4e5-node-install-loop
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261121T090000Z
actor: agent
role: agent
lane: standard
priority: must
size: L
title: Node.js/npx installer with question loop and no-coding gate
req_links:
  - REQ-m7n8-eval-runs
---
# Story

As a developer, I want to install Agentflow via `npx`, run it in a loop that collects my answers to blocking questions until all are resolved, and have the framework forbid any agent from coding until every blocking question is closed (unless I explicitly say "skip").

## Acceptance Criteria
- AC1: `npx <repo>/bin/agentflow.js install <project>` (or `npm install -g .` + `agentflow install <project>`) installs the framework into a target project non-destructively.
- AC2: `agentflow loop <project>` scans `.agentflow/questions/` for blocking unanswered questions, prompts the developer one at a time, writes verbatim answer records, and repeats until no open blocking questions remain.
- AC3: `agentflow doctor <project>` (pre-edit gate) refuses to proceed if any blocking question is unanswered OR requirements are not baselined, unless `--skip-questions` is passed.
- AC4: The edit lock / manifest check honors the gate: manifests created while open blocking questions exist carry a `questions_closed: false` flag and are rejected by the gate.
- AC5: All existing functionality (Python validator, existing installer, adapters) keeps working; new Node.js CLI is additive.

## Verification Methods
- AC1–AC3: command-output (fresh temp installs, loop runs, doctor gate tests)
- AC4: document-review + command-output (manifest flag + doctor rejection)
- AC5: command-output (`python tools/validate.py .` still PASS)

## Test Plan
- Own tests: temp-dir installs via node, loop with simulated answers, doctor gate pass/fail
- Regression set: `python tools/validate.py .` PASS; `python tools/validate.py evals/golden-project` PASS
- Manifest mapping: `package.json`, `bin/agentflow.js`, `tools/agentflow-gate.js` → this ticket

## Notes
- Depends on: none new; builds on existing `.agentflow/questions/` and `requirements/` record types.
- Owner decision needed: confirm the Node.js wrapper approach (call Python installer) vs full Node port of installer.
