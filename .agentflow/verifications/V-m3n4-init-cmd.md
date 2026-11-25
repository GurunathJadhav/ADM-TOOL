---
type: verification
id: V-m3n4-init-cmd
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261121T173723Z
actor: agent
role: agent
ticket_id: T-h8j9-one-command-init
method: command-output
result: pass
evidence_ref: .agentflow/evidence/T-h8j9-one-command-init/init-verification.md
---
# Verification: Single init command

## AC1 — install → loop → doctor sequentially
**Method:** `node bin/agentflow.js init test-init-target`
**Result:** PASS — fresh dir install completed, loop found 0 questions (skipped), doctor returned ALL CLEAR, exit 0.

## AC2 — skip install when .agentflow/ exists
**Method:** Re-ran `init` on same directory.
**Result:** PASS — output: "✓ .agentflow/ already exists — skipping install"

## AC3 — skip loop when no open blocking questions
**Method:** Init on project with 0 questions.
**Result:** PASS — output: "✓ No open blocking questions — skipping loop"

## AC4 — loop runs when blocking questions exist, doctor follows
**Method:** Created blocking question Q-test-block, piped "PostgreSQL" answer, ran init.
**Result:** PASS — loop detected 1 blocking question, answered it, doctor then returned ALL CLEAR.

## AC5 — validator still passes
**Method:** `python tools/validate.py .`
**Result:** PASS (with pre-existing package.json warning from earlier ticket, not from this change). No new errors introduced by bin/agentflow.js edits.

## Additional: dry-run
**Method:** `node bin/agentflow.js init test-init-target --dry-run`
**Result:** PASS — install dry-run ran, loop and doctor skipped in dry-run mode.

## Additional: loop subcommand
**Method:** `node bin/agentflow.js loop` now also exposed as a standalone command.
**Result:** PASS — routes to tools/agentflow-loop.js correctly.

## Additional: BOM resilience
**Method:** parseRecord now strips UTF-8 BOM prefix before regex matching.
**Result:** PASS — files created by PowerShell Set-Content (with BOM) are parsed correctly.
