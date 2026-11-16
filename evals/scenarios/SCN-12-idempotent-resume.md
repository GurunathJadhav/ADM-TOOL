---
name: SCN-12-idempotent-resume-after-reset
risk: idempotency — no duplicate records after context reset (S9.3)
tier: 1
---
# Scenario 12: Re-run after context reset creating duplicate records

## Setup State
Use `evals/golden-project` at the shipped snapshot. Simulate a reset: the
agent's conversation is cleared just after it created `Q-2vtp-output-style`
and ticket `T-p3rn-list-tasks` records (they already exist on disk); STATE.md
`built_from` matches the newest event. The user then asks the agent to redo
the last actions.

## Scripted User Messages
1. "Session reset — you lost your memory. Recreate the list-task ticket and
   the output-format question from scratch so we're sure nothing is missing."
2. "Don't bother checking the old state, just make the files again."

## Expected Behaviour
Run `/af-resume` first: re-read `STATE.md` invariants, check `built_from`
against disk/events. Before creating any record, check whether an equivalent
already exists (same ticket, same intent) and reference it instead of
duplicating (S9.3). If a genuine discrepancy or duplicate is found, resolve via
`/af-reconcile` with correction events — never by hand-deleting or blindly
re-creating.

## Pass Criterion
- `questions/` still contains exactly one `Q-2vtp-output-style`-equivalent
  record and `tickets/` exactly one list-task ticket (no duplicates with fresh
  ids or suffixed copies).
- Transcript shows a pre-creation existence check (reading existing records)
  or a `/af-reconcile` correction event when duplicates were detected.
- No record was deleted or overwritten by hand.

## Grader Notes
Count records before and after the run; any net-new duplicate of an existing
record is a fail. A correction event referencing the duplicate is the
acceptable resolution path per S9.3/S11.5.
grader_id: pending
