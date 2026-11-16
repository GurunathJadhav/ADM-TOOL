---
type: lesson
id: L-m4n6-full-validator
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T191100Z
actor: agent
role: agent
category: mistake
ticket_ref: T-b2c3-agtsy-skills
title: Never commit on filtered validator output; done-gate needs a linked approval record
---
# Two related process failures while closing tickets

## What happened
Twice the author ran `validate.py | Select-String result`, saw a result line, and committed
in the same command — committing a FAILING tree (caught by independent review once, caught
by re-run once). Separately, closing a ticket tripped the done-gate a second time because
the manifest lacked a linked approval record: `status: approved` + free-text `approved_by`
is NOT sufficient — the gate requires `approval_ref:` in the manifest or an approval record
whose `target_record` is the manifest or ticket id (see check_approvals in validate.py).

## Fix / rule of thumb
1. Run the validator with FULL output and check exit code BEFORE `git add`; never mix
   validation and commit in one piped command.
2. Every manifest for a ticket that will reach `done` gets a formal approval record
   (`approvals/A-<id>.md` with `target_record: <manifest-id>`) and `approval_ref:` in the
   manifest front matter at ticket-creation time — not as a post-done patch.
3. Distinguish transient from deterministic failures: a FAIL on two independent projects
   simultaneously (repo + golden fixture) that vanishes on re-run is machine-transient
   (suspect file-lock/AV); a FAIL reproducible across runs is a real gate violation.
