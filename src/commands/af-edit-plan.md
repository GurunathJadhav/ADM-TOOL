---
name: af-edit-plan
description: Draft a scoped Edit Manifest for a claimed ticket with criterion mapping and overlap checks
phase: implementation, maintenance
tier: 0
actor: both
core: false
---

# /af-edit-plan — Create Edit Manifest

## Purpose
Prepares a strictly scoped Edit Manifest (`manifests/T-<id>.md`) prior to touching any project code or configuration. Binds every proposed file modification or creation to an explicit acceptance criterion, enforces file/line edit budgets by size (S/M), verifies compliance with the Overlap Rule (no two active tickets editing the same file), conducts the Simplicity Gate check, and submits the manifest for required human approval or logs standing approval eligibility.

## Preconditions
- [ ] Active phase is `implementation` or `maintenance`.
- [ ] Target ticket exists in `tickets/T-*.md` with Given/When/Then acceptance criteria.
- [ ] Ticket is claimed by the current actor.
- [ ] Edit lock is currently `locked`.

## Steps
1. **Simplicity & Craft Check (§S7):**
   - Identify the minimal clean architecture meeting the acceptance criteria (no speculative abstractions or unneeded wrapper layers).
   - **UI/UX Rule:** Never cut visual polish, theme tokens, responsive styling, or empty/loading/error states for "simplicity". Include component + styles + test files together as one cohesive vertical slice!
   - Reject unrelated drive-by refactors outside the ticket.
2. **Determine File Scopes & Criterion Mapping:**
   - **Allowed to Modify:** List exact file paths (or narrow globs), each explicitly paired with its criterion ID.
   - **Allowed to Create:** List exact new files, directories, or approved packages.
   - **Explicitly Not Touched:** Explicitly list related modules, shared config, or protected files that must remain untouched.
3. **Budget & Protected Paths Check:**
   - Check proposed edits against ticket size budget (`project.md`):
     - `S`: <= 5 files / 250 lines
     - `M`: <= 12 files / 800 lines
     - Exceeds M: HALT — split ticket into smaller vertical slices.
   - Cross-reference with `.agentflow/protected.md`. If any file is protected (e.g. lockfiles, CI, secrets, migrations), flag as high-risk requiring explicit user approval.
4. **Overlap Rule Enforcement (§S5.2):**
   - Scan all active manifests in `.agentflow/manifests/`.
   - Ensure none of the proposed files are currently claimed by another in-progress ticket.
   - If a collision exists, work cannot start until the previous ticket finishes or the owner approves an explicit sequencing.
5. **Write Edit Manifest Record:**
   - Create `.agentflow/manifests/T-<ticket-id>.md` with front matter:
     - `type: manifest`
     - `id: manifest-T-<ticket-id>`
     - `project_id: <project_id>`
     - `schema_version: 1.0.0`
     - `created: <UTC-compact>`
     - `actor: agent`
     - `role: implementer`
     - `ticket_id: T-<ticket-id>`
     - `size: <S|M>`
     - `status: pending_approval`
   - Document allowed to modify, allowed to create, forbidden files, edit budget, and simplicity justification in the body.
6. **Log Event & Check Approvals:**
   - Write event:
     `events/<UTC-compact>-T-<ticket-id>-manifest-drafted-manifest-T-<ticket-id>.md`
   - Evaluate approval route:
     - If eligible for standing approval SA1 (S/M feature manifest in `src/` and tests in `rapid`/`balanced`, or S-size in `strict`, with no protected paths): log standing approval reference in `approvals/A-<id>.md` (or manifest header) and proceed immediately without blocking.
     - Otherwise: add to `.agentflow/APPROVALS-NEEDED.md` and present manifest to approver in chat for sign-off.
7. **Rebuild STATE.md:**
   - Update `STATE.md` with active manifest proposal.

## Postconditions
- [ ] `.agentflow/manifests/T-<ticket-id>.md` created with granular file limits and criterion mappings.
- [ ] Overlap check verified with zero collisions.
- [ ] Event `manifest-drafted` logged.
- [ ] Manifest submitted for human approval or standing approval logged.

## Next
- **Approved / Standing Approval:** `/af-start-ticket` — Establish baseline and engage implementation micro-cycle.
- **Awaiting User Approval:** Wait for user sign-off in chat.
- **Overlap Conflict:** Wait on prior ticket or consult owner for ticket ordering.

## Common Mistakes
- Using broad wildcards like `src/**/*` or listing the whole repository.
- Modifying files without mapping each path to a specific acceptance criterion.
- Ignoring active manifests on parallel branches or tickets, causing merge conflicts.
- Silently bundling formatting cleanups or drive-by refactorings into the manifest.

## Footer Template
`Done: drafted manifest for <ticket-id> (<file_count> files, budget: <size>) | Logged: <event-id> | Next: /af-start-ticket upon approval | Needs you: approve manifest manifests/T-<ticket-id>.md`
