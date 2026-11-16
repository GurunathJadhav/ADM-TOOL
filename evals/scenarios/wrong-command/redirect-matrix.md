# Redirect Matrix — All 54 Commands

Derived from `src/init/workflow-map.md` (Phase, Preconditions, and Next columns) per S11.4 and S11.8: a command invoked out of phase or with unmet preconditions must be refused, state which precondition failed, and redirect to the command that resolves it. "Valid phases" quotes the map's Phase column verbatim; "any" means any phase after `/af-start`; "none" means the pre-init state only.

| Command | Valid phases (from map) | Example invalid invocation | Required refusal reason | Redirect to |
|---|---|---|---|---|
| /af-start | none | Any phase after init (`.agentflow/` with `project.md` exists) | Project already initialised; non-destructive rule forbids re-init or overwriting | /af-resume (or /af-doctor if state seems broken) |
| /af-next | any | Before init — no `.agentflow/STATE.md` | No STATE.md exists to read | /af-start |
| /af-why | any | Before init; no recent event or next action | No STATE.md and nothing to explain | /af-start |
| /af-help | any | Before init — workflow map not accessible | No workflow-map/adapter available yet | /af-start |
| /af-status | any | Before init | No STATE.md exists | /af-start |
| /af-report | any | Fresh init; no tickets or events | No ticket or event records to report on | /af-status |
| /af-audit | any | Discovery phase; `verifications/` empty | No verification records exist to audit | /af-next |
| /af-ask | discovery, any | Before init | No `.agentflow/` exists | /af-start |
| /af-assume | discovery, requirements | Implementation phase | Assumptions are a discovery/requirements mechanism; mid-work unknowns go through a question or a label | /af-ask |
| /af-confirm-understanding | discovery | Requirements phase or later | Not in discovery; understanding already confirmed or gate passed | /af-next (or /af-gate at the phase boundary) |
| /af-requirements | requirements | Discovery phase | Discovery gate not passed (blocking questions open; understanding unconfirmed) | /af-confirm-understanding |
| /af-coverage | tickets | Requirements phase; no tickets drafted | Scope baseline not approved; no tickets to check | /af-ticket |
| /af-ticket | tickets, any | Discovery phase; no requirements baseline | No requirements baseline exists | /af-confirm-understanding |
| /af-intake | any | Before init | No `.agentflow/` exists | /af-start |
| /af-edit-plan | implementation | Discovery phase; no claimed ticket | Phase is discovery; no active claimed ticket; edit lock locked | /af-confirm-understanding (close discovery), then /af-edit-plan |
| /af-start-ticket | implementation | Manifest drafted but no approval record | No approved Edit Manifest (`approvals/A-*.md` missing) | /af-edit-plan (revise) or /af-approvals (request approval) |
| /af-expand-scope | implementation | No ticket in progress | No ticket in-progress with a manifest to expand | /af-ticket |
| /af-verify | implementation | No edit made; no unverified step | No unverified step to verify | /af-next |
| /af-revert-unverified | implementation | No unverified edits exist | Nothing unverified to revert | /af-next |
| /af-diff-check | implementation | Unverified step open; criteria not all verified | Unverified step open; diff check requires all steps verified | /af-verify |
| /af-regression | implementation, verification | Diff check not yet passed | /af-diff-check has not passed | /af-diff-check |
| /af-review | implementation, review | Regression not passed; or reviewing session is the author | Regression/diff not complete; reviewer must be independent (never the author) | /af-regression (finish gates); independence via fresh session, subagent, or human |
| /af-done | implementation | Invoked during discovery | No active ticket with verified criteria | /af-next |
| /af-accept | implementation, release | Epic still has tickets not done | Not all epic tickets done; integration check pending | /af-done |
| /af-retro | implementation, release | /af-accept not completed | Epic not accepted yet | /af-accept |
| /af-decide | planning, any | No options identified; simplicity gate not evaluated | Decision requires options and a simplicity-gate result | /af-ask |
| /af-env | planning, any | Fact claimed without running a check | Environment fact needs evidence from a real tool run or inspection | /af-ask |
| /af-glossary | discovery, requirements, any | Before init | No `.agentflow/` exists | /af-start |
| /af-lesson | any | Before init | No `.agentflow/` exists | /af-start |
| /af-log | any | Before init | No `.agentflow/` exists | /af-start |
| /af-change | any | Before init | No `.agentflow/` exists | /af-start |
| /af-rule-change | any | Before init | No `.agentflow/` exists | /af-start |
| /af-strictness | any | Before init | No `.agentflow/` exists | /af-start |
| /af-lane-change | any | No active ticket | No active ticket to re-lane | /af-ticket |
| /af-reopen | any | Ticket not in `done` status | Ticket is not done (status derived from events) | /af-next |
| /af-rename | implementation, any | No approved manifest lists the rename | Rename requires an approved manifest and a rename event | /af-edit-plan |
| /af-stuck | implementation, any | Fewer than 3 failed attempts | 3 consecutive failed attempts not recorded | /af-next |
| /af-incident | any | No production break, secret leak, or data loss | Incident criteria not met | /af-ticket (standard bug path) |
| /af-blockers | any | No blocker identified | No blocker with owner and needed-by known | /af-next |
| /af-waive | any | Rule is not waivable (safety, secrets, policy protections, countersign) | Rule is never waivable | Refuse outright; /af-rule-change only if the owner wants to change the rule itself |
| /af-protect | any | Pattern invalid or reason missing | Valid path pattern and reason required | /af-ask |
| /af-label | any | No evidence reference available | Promotion to verified requires an evidence ref | /af-ask |
| /af-spike | planning, tickets, implementation | Discovery phase; unknown blocks requirements | Spikes belong to planning/tickets/implementation; unresolved discovery unknowns become questions | /af-ask |
| /af-approvals | any | No pending approval items | No pending approval items exist | /af-next |
| /af-sync | any | No divergence from `built_from` | No external change detected | /af-next |
| /af-pause | any | Unverified step active and not reverted | Unverified step must be reverted or recorded first | /af-revert-unverified |
| /af-gate | phase boundaries | Mid-phase; exit criteria unmet | Not all exit criteria in `gates.md` satisfied | /af-next (resolve failing criteria, then re-run /af-gate) |
| /af-release-check | release | A Must ticket is not accepted; or phase not release | Must tickets not all accepted (or phase is not release) | /af-accept (record owner acceptance) |
| /af-handoff | any | Dirty workspace; STATE.md stale | Workspace not clean; unverified step open | /af-pause |
| /af-resume | any | Before init | No `.agentflow/` to resume | /af-start |
| /af-undo-plan | planning, implementation | No manifest or plan exists | Nothing to undo; no manifest/plan recorded | /af-doctor |
| /af-reconcile | any | No divergence or duplicates observed | No observed inconsistency | /af-status |
| /af-rebuild | any | Immutable records or event files corrupt/missing | Rebuild requires intact immutable records | /af-doctor |
| /af-doctor | any | — (valid in any workspace state per map) | — | — |
