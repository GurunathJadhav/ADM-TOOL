# Agentflow Concepts

The core ideas behind Agentflow, and their honest limits.

## Tiers (0 / 1 / 2)

At `/af-start` the agent tests what it can actually do and declares its tier, recorded in `environment/`:

- **Tier 0** — read/write files or chat only. No commands. In plain chat, the agent emits files as `FILE:` blocks you paste back (S1). Instructions cannot technically block an edit.
- **Tier 1** — can also run commands (validator possible).
- **Tier 2** — hooks, CI, or MCP available; only Tier 2 can actually block an edit or commit.

## Records

One file per record, in `.agentflow/` subfolders: `questions/Q-`, `events/`, `decisions/D-`, `tickets/T-`, `manifests/`, `baselines/`, `verifications/V-`, `approvals/A-`, `claims/CL-`, `blockers/B-`, `reviews/R-`, `requirements/REQ-`, `glossary/<term>`, `risks/RISK-`, `lessons/L-`, `environment/<fact>`, `waivers/W-`, `evidence/<ticket>/`.

- Each record is one Markdown file with a front-matter block (`type`, `id`, `project_id`, `schema_version`, `created`, `actor`, `role`, plus type-specific fields) and a readable body.
- **IDs:** `<Prefix>-<4 random base32 chars>-<slug>` (e.g. `T-x4kq-auth`). No global counters; ordering is by timestamp, from a real clock in compact UTC (`20261115T093000Z`). Agents never invent a time — without a clock they write `ts: unknown` and flag it.
- **Records are immutable.** A correction is a new event superseding the earlier one; files are never edited after creation.

## Events are the only status source

Ticket, question, and claim status is read from the **latest event for that id** (list `events/` filtered by id). Filenames carry the facts: `events/<UTC-compact>-<ticket-or-none>-<event-type>-<id>.md`. Event types include answers, approvals, transitions, reverts, reopens, external changes, gates.

## Derived views are disposable

`STATE.md`, indexes (`requirements.md`, `traceability.md`, …), `CHEATSHEET.md`, `APPROVALS-NEEDED.md` are rebuilt from records. After a merge conflict, delete and rebuild — never hand-merge. `STATE.md` (~1,000 tokens) starts with a fixed invariants block and always holds `next_action: <exact command and reason>`.

## Edit lock, Edit Manifest, baselines

- **Edit lock** is `LOCKED` by default. Source/config/dependency files may be edited only when an active claimed ticket exists, its Edit Manifest is approved, and the pre-edit checklist is recorded.
- **Edit Manifest** (`manifests/T-<id>.md`): files allowed to modify (exact paths tied to criteria), allowed to create, explicitly not touched, and an edit budget. Anything not listed is forbidden. Two active manifests may not overlap on the same file.
- **Verify-before-edit checklist** (once per manifest file): the agent has read the current file, confirmed every API/flag it will use exists, listed callers, reproduced the bug (bugs) or has a failing test first (features).
- **Baseline** (`baselines/T-<id>.md`): recorded at `/af-start-ticket` (repository revision, or file copies/checksums without git) so `/af-revert-unverified` can restore the current step. Micro-cycle: one logical change (~50 lines default) → verify → evidence → next; never stack unverified edits.

## Phases and gates

`discovery → requirements → tickets → planning → implementation → verification → review → release → maintenance`. Each gate in `gates.md` has written, checkable exit criteria; the agent verifies and logs a gate event, and **the owner approves each advance**. Key gates: requirements baseline approved (requirements), coverage check passes (tickets), full quality profile passes (verification), owner's explicit go-ahead (release).

## Lanes

Per-ticket intensity, proposed by the agent, confirmed by you:

| Lane | Done requires |
|---|---|
| Trivial | one verification, diff check vs tiny manifest, one-line log entry |
| Standard | evidence per criterion, clean diff, regression, independent review |
| Incident | reproduction evidence, minimal fix, one approver, follow-up ticket |
| Project-level | the phase gates |

A ticket moving to a weaker lane mid-work needs an approved `/af-lane-change`.

## Strictness

`project.md` sets `strictness: light | balanced | strict` (changed only via `rule-change`). It scales discovery depth, manifest approval, unverified-step size (~150 lines / ~50 lines / one file), review independence, and the quality profile.

## Roles, approvals, countersign

- **Roles** in `project.md`: owner (scope, gates, rule changes), approver(s), reviewer(s), observers. Solo users hold all roles. Every approval names who said it and under which role.
- **Approvals** (`approvals/A-<id>.md`) quote your message verbatim and bind to **one record**. Any change creates a new record needing its own approval.
- **High-risk approvals** (rule changes, protected paths, production, new dependencies) additionally need a **countersign**: a user-authored commit, or you personally creating/editing the approval file or typing the approval id in a separate message.

## Confidence labels and evidence

Factual statements are labelled **verified** (evidence reference), **inferred** (basis stated), or **unknown**. Unlabelled counts as inferred. Inferred facts cannot justify an edit, a dependency, or `done` until promoted (`/af-label`). **Evidence** lives in `evidence/<ticket>/<name>.md` — pasted raw output, trimmed to ~200 lines, referenced by path. Reviewers re-run verification commands rather than trusting pasted output.

## The honest limits (S14)

An agent with unrestricted file access can forge or edit records. Instruction-level rules can be bypassed; only Tier 2 hooks/CI block anything mechanically. User-owned commits, independent review, and CI are the real backstop. See `docs/limits-of-enforcement.md`.
