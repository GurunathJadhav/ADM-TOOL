---
name: af-gate
description: Evaluate phase exit criteria, obtain owner approval, and advance to next project lifecycle phase
phase: any
tier: 0
actor: both
core: false
---

# /af-gate — Phase Gate Transition

## Purpose
Enforces formal lifecycle transitions across project phases: `discovery → requirements → tickets → planning → implementation → verification → review → release → maintenance` (§S10.1). Evaluates objective, written exit criteria from `gates.md`, verifies absence of open blockers or unconfirmed assumptions, compiles a formal gate report, and requests mandatory owner approval. Under no circumstances may an agent advance a phase gate without explicit owner sign-off.

## Preconditions
- [ ] Active ticket is `none` (cannot transition phases during an active ticket).
- [ ] Edit lock is `locked`.
- [ ] No unverified steps or open blocking questions remain in the current phase.

## Steps
1. **Identify Current Phase & Target Gate:**
   - Read current `phase` from `STATE.md`.
   - Read corresponding exit criteria from `.agentflow/gates.md`:
     - **Discovery Gate:** All blocking questions answered, all assumptions confirmed, discovery summary approved by owner.
     - **Requirements Gate:** Scope baseline approved by owner, requirements catalog baselined.
     - **Tickets Gate:** Traceability coverage 100% for Must/Should requirements, zero orphan tickets.
     - **Planning Gate:** Environment facts recorded, architecture decisions documented, test runner bootstrapped.
     - **Implementation Gate:** All planned tickets marked `done` with verified criteria and closed reviews.
     - **Verification Gate:** Full project regression passed, quality profile gates cleared.
     - **Review Gate:** Security, architecture, and dependency reviews passed with zero blocking findings.
     - **Release Gate:** All Must tickets accepted, release notes drafted, rollback plan documented, owner go-ahead.
2. **Audit Exit Checklist:**
   - Programmatically verify that every prerequisite artifact, event, and verification record exists.
   - If any exit condition is unmet: **HALT**. Output which condition failed and indicate the exact command that resolves it.
3. **Present Gate Checklist to Project Owner:**
   - Display the validated checklist to the owner in chat:
     "Owner: all exit criteria for phase `<current-phase>` are satisfied.
     - [x] Criterion 1 (verified by ...)
     - [x] Criterion 2 (verified by ...)
     Do you approve advancing the project to phase `<target-phase>`?"
4. **Obtain & Record Owner Sign-Off:**
   - Upon receiving the owner's explicit confirmation:
     - Write approval record: `.agentflow/approvals/A-<4 base32 chars>-gate-<current>-to-<target>.md`.
     - Log gate transition event:
       `events/<UTC-compact>-none-gate-advanced-gate-<current>-to-<target>.md`
5. **Update Project State:**
   - Update `phase: <target-phase>` in `STATE.md`.
   - Set `next_action`: initial command for the new phase (as dictated by `workflow-map.md`).
   - Rebuild `STATE.md`.

## Postconditions
- [ ] Gate exit criteria verified against `gates.md`.
- [ ] Owner approval record `.agentflow/approvals/A-<id>.md` created.
- [ ] Event `gate-advanced` recorded in `events/`.
- [ ] `phase` successfully advanced in `STATE.md`.

## Next
- **Advanced to Requirements:** `/af-requirements`
- **Advanced to Tickets:** `/af-ticket`
- **Advanced to Planning:** `/af-decide` or `/af-env`
- **Advanced to Implementation:** `/af-edit-plan` (for first ticket)
- **Advanced to Verification:** `/af-regression`
- **Advanced to Review:** `/af-review`
- **Advanced to Release:** `/af-release-check`
- **Criteria Unmet:** Execute the specific command required to satisfy the failing criterion.
- **Awaiting Approval:** Wait for owner response in chat.

## Common Mistakes
- Simulating or assuming owner approval to jump phases without human confirmation.
- Advancing phase while a ticket is still marked in-progress.
- Bypassing the coverage check when exiting the tickets phase.

## Footer Template
`Done: advanced phase from <old-phase> to <new-phase> | Logged: <event-id> | Next: <initial-phase-command> | Needs you: approve gate transition if pending, else nothing`
