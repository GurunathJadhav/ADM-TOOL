---
name: af-review
description: Assemble independent review packet, re-run verifications, and record findings before ticket completion
phase: implementation, verification, review
tier: 0
actor: both
core: false
---

# /af-review — Independent Review

## Purpose
Enforces the mandatory Independent Review requirement before any Standard ticket can be marked done (§S6.4). Assembles an objective review packet containing only the ticket criteria, approved manifest, unified diff, and evidence (excluding the author's internal reasoning). The independent reviewer (a fresh agent session or a human) inspects the code and re-runs verification commands directly. Records findings in `reviews/R-<id>.md`; any blocking finding strictly halts `/af-done`.

## Preconditions
- [ ] Active ticket claimed and in progress.
- [ ] Diff check cleared (`/af-diff-check` green).
- [ ] Regression suite passed (`/af-regression` green).
- [ ] Evidence records exist for all criteria.

## Steps
1. **Assemble Independent Review Packet (§S6.4):**
   - Extract:
     - Target ticket story and criteria (`tickets/T-<ticket-id>.md`).
     - Approved manifest (`manifests/T-<ticket-id>.md`).
     - Unified diff against baseline.
     - Evidence logs from `evidence/<ticket-id>/`.
   - Strip all internal author reflections, notes, or speculative reasoning to prevent confirmation bias.
2. **Assign Reviewer Role:**
   - Determine reviewer mode from `project.md` and `strictness`:
     - **Strict / Protected Paths / Must Tickets:** Human reviewer sign-off required.
     - **Balanced:** Independent agent session or human reviewer.
     - **Light:** Fresh session self-check permitted.
3. **Execute Review Checks & Re-Run Verifications:**
   - Reviewer audits code for:
     - Correctness against Given/When/Then acceptance criteria.
     - Security vulnerabilities (injection, auth, data leakage).
     - Code clarity, maintainability, and absence of over-engineering.
     - Adherence to project architecture and decisions.
   - **Re-run verification commands:** The reviewer must directly execute the verification commands to prove the results match recorded evidence.
4. **Draft Review Record:**
   - Create `.agentflow/reviews/R-<4 base32 chars>-<slug>.md` with front matter:
     - `type: review`
     - `id: R-<id>`
     - `project_id: <project_id>`
     - `schema_version: 1.0.0`
     - `created: <UTC-compact>`
     - `actor: <reviewer-name>`
     - `role: reviewer`
     - `ticket_id: T-<ticket-id>`
     - `review_type: <human|agent_independent|fresh_session>`
     - `verdict: <approved|changes_requested>`
     - `blocking_findings_count: <n>`
   - Document individual findings categorized as `blocking` or `suggestion`.
5. **Log Event:**
   - Write event:
     `events/<UTC-compact>-T-<ticket-id>-review-completed-R-<id>.md`
6. **Rebuild STATE.md:**
   - Record review verdict in `STATE.md`.

## Postconditions
- [ ] Independent review packet evaluated.
- [ ] Record `.agentflow/reviews/R-<id>.md` written with explicit verdict.
- [ ] Event `review-completed` logged.
- [ ] `STATE.md` updated with review status.

## Next
- **Approved (0 blocking findings):** `/af-done` — Proceed to complete the ticket.
- **Changes Requested (blocking findings open):** Fix identified issues within manifest bounds, run `/af-verify`, and request re-review.
- **Blocked:** Wait for human reviewer sign-off when required by strictness or protected paths.

## Common Mistakes
- Author acting as sole reviewer on their own Standard tickets without an independent check.
- Approving a review without actually re-running the verification commands.
- Proceeding to `/af-done` when blocking review findings remain unresolved.
- Including author rationales in the review packet that bias the reviewer.

## Footer Template
`Done: completed independent review R-<id> (verdict: <verdict>, blocking: <n>) | Logged: <event-id> | Next: <af-done or fix findings> | Needs you: <human review if required, else "nothing">`
