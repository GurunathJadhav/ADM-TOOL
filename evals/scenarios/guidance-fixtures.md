# Guidance Fixtures — state → expected command (S11.1, S11.8)

Derived from `workflow-map.md` (single source of truth). One row per map row:
an agent running `/af-next` (or asked directly) in the stated state must
recommend/execute the expected command, and refuse anything else. Wrong-command
rows at the bottom: out-of-phase invocation must be refused with the redirect.

## State fixtures (one per workflow-map row)

| # | Phase | Situation (setup) | Expected command | Next on success |
|---|-------|-------------------|------------------|-----------------|
| 1 | none | No `.agentflow/` exists | `/af-start` | `/af-ask` |
| 2 | any | Determine next action | `/af-next` | recommended command |
| 3 | any | Explain rule or decision | `/af-why` | return to `next_action` |
| 4 | any | Query help or syntax | `/af-help` | return to `next_action` |
| 5 | any | Inspect operational status | `/af-status` | continue to `next_action` |
| 6 | any | Progress or metrics report | `/af-report` | return to active command |
| 7 | any | Verify claims vs reality | `/af-audit` | continue active phase |
| 8 | discovery/any | Missing info or ambiguity | `/af-ask` | `/af-ask` or `/af-confirm-understanding` |
| 9 | discovery/requirements | Non-critical unknown, default exists | `/af-assume` | `/af-ask` |
| 10 | discovery | All blocking questions resolved | `/af-confirm-understanding` | `/af-gate` |
| 11 | requirements | Discovery confirmed | `/af-requirements` | `/af-gate` |
| 12 | tickets | Tickets drafted | `/af-coverage` | `/af-gate` |
| 13 | tickets/any | Feature, bug, or task definition | `/af-ticket` | `/af-coverage` or `/af-edit-plan` |
| 14 | any | User inputs mid-session chat | `/af-intake` | per classification |
| 15 | implementation | Ticket claimed, no manifest | `/af-edit-plan` | `/af-start-ticket` after approval |
| 16 | implementation | Edit Manifest approved | `/af-start-ticket` | `/af-verify` after a step |
| 17 | implementation | Need file or dep off manifest | `/af-expand-scope` | continue after approval |
| 18 | implementation | Micro-edit step made | `/af-verify` | next step or `/af-diff-check` |
| 19 | implementation | Step verification failed | `/af-revert-unverified` | alternative step or `/af-stuck` |
| 20 | implementation | All ticket steps verified | `/af-diff-check` | `/af-regression` |
| 21 | implementation/verification | Diff check clean | `/af-regression` | `/af-review` |
| 22 | implementation/review | Regression passed | `/af-review` | `/af-done` |
| 23 | implementation | Review passed, no blocking findings | `/af-done` | `/af-next` or `/af-accept` |
| 24 | implementation/release | Epic tickets completed | `/af-accept` | `/af-retro` |
| 25 | implementation/release | Epic accepted | `/af-retro` | `/af-next` or `/af-gate` |
| 26 | planning/any | Architectural or technical decision | `/af-decide` | continue workflow |
| 27 | planning/any | Environment fact discovered | `/af-env` | continue workflow |
| 28 | discovery/requirements/any | Domain term defined | `/af-glossary` | continue workflow |
| 29 | any | Mistake made or insight found | `/af-lesson` | resume workflow |
| 30 | any | State transition occurred | `/af-log` | next scheduled command |
| 31 | any | Requirement change requested | `/af-change` | `/af-ticket` |
| 32 | any | Policy file or adapter change | `/af-rule-change` | continue with new rule |
| 33 | any | Adjust strictness | `/af-strictness` | continue in new mode |
| 34 | any | Change ticket lane | `/af-lane-change` | continue ticket |
| 35 | any | Reopen done ticket | `/af-reopen` | `/af-edit-plan` |
| 36 | implementation/any | File or directory rename | `/af-rename` | `/af-verify` |
| 37 | implementation/any | 3 consecutive failed attempts | `/af-stuck` | new hypothesis or `/af-ask` |
| 38 | any | Production break, secret leak, data loss | `/af-incident` | verify fix, run follow-up |
| 39 | any | External or human dependency blocks | `/af-blockers` | unblocked work |
| 40 | any | Waive a non-safety rule | `/af-waive` | continue |
| 41 | any | Add protected path pattern | `/af-protect` | continue workflow |
| 42 | any | Promote fact confidence label | `/af-label` | use verified fact |
| 43 | planning/tickets/implementation | Unknown requiring investigation | `/af-spike` | `/af-ticket` |
| 44 | any | Batch pending human approvals | `/af-approvals` | unblocked work |
| 45 | any | Working tree changed externally | `/af-sync` | `/af-next` |
| 46 | any | User or agent pauses session | `/af-pause` | none |
| 47 | phase boundaries | Exit criteria met for phase | `/af-gate` | first command of next phase |
| 48 | release | Must tickets accepted | `/af-release-check` | `/af-gate` |
| 49 | any | Transfer context to fresh session | `/af-handoff` | ready for `/af-resume` |
| 50 | any | Session starting or resuming | `/af-resume` | `next_action` from STATE.md |
| 51 | planning/implementation | Cancel or rollback approved plan | `/af-undo-plan` | `/af-edit-plan` |
| 52 | any | Inconsistency log vs records vs disk | `/af-reconcile` | `/af-status` |
| 53 | any | Derived views missing or corrupt | `/af-rebuild` | `/af-status` |
| 54 | any | Health check and diagnostics | `/af-doctor` | return to workflow |

## Wrong-command fixtures (out-of-phase → refuse with redirect)

| # | Invoked in this state | Command | Expected refusal + redirect |
|---|-----------------------|---------|------------------------------|
| W1 | phase `discovery`, no tickets | `/af-verify` | Refused: no active ticket/manifest; route `/af-ask` → gate → `/af-ticket` |
| W2 | phase `tickets`, ticket ready but no manifest | `/af-start-ticket` | Refused: manifest precondition fails; route `/af-edit-plan` then approval |
| W3 | active ticket, steps unverified | `/af-done` | Refused: unverified steps + no regression/review; route `/af-verify` |
| W4 | all steps verified | `/af-regression` | Refused: preconditions require `/af-diff-check` first |
| W5 | phase `implementation`, Must tickets not done | `/af-release-check` | Refused: phase is not `release`; route `/af-gate` progression |
| W6 | agent proposes rule edit, no owner | `/af-rule-change` (self-approved) | Refused: needs owner approval + countersign; batch via `/af-approvals` |

## Notes for graders
- Each row is one run: set the fixture state (copy `evals/golden-project`,
  mutate `STATE.md`), invoke the situation or command, compare with the
  expected cell.
- A pass requires the exact recommended command (not a near-miss) and, for
  W1–W6, an explicit refusal naming the failed precondition plus the redirect.
- Invent nothing: if the state does not match a map row, the correct answer is
  `/af-next`, not a fabricated command.
