# Golden Example Project — `todo-notes`

Tiny CLI task tracker: `todo-notes add|list|complete <args>`, tasks persisted in a
single JSON file. One-line app spec (the only app description that exists):

> A command-line app where the user adds tasks (`add`), lists open tasks
> (`list`), and marks tasks complete (`complete`); tasks survive between runs
> in one JSON file.

**Fixture shows process state, not code.** The `src/` implementation is
deliberately absent — this project is a walkthrough of the Agentflow
`.agentflow/` state at a mid-implementation snapshot (20261110T091500Z), used
as fixture and documentation for evals (S19).

## Snapshot

- `project_id` af-prj-9001 · strictness `balanced` · solo roles · tier 1
- Phase `implementation`; active ticket `T-p3rn-list-tasks` (in-progress,
  manifest approved via standing approval SA1); edit lock unlocked for it only
- Done: `T-7h2j-bootstrap` (walking skeleton + test setup) and `T-x4kq-add-task`
  (full standard-lane loop incl. red→green→regression→review)
- Backlog: `T-w9vt-complete-task`, bug `T-d6tb-list-output-bug`;
  open human blocker `B-5wqj-terminal-colours` (awaiting owner decision)

## Layout (record counts)

| Directory | Contents |
|---|---|
| `questions/` | 4 Q records: 2 answered, 1 assumed+confirmed, 1 deferred |
| `requirements/` | 4 REQ: 3 baselined (must/should), 1 proposed |
| `tickets/` | 5 T records with Given/When/Then, per-criterion method, MoSCoW, size, test plan |
| `manifests/` | 2 (add-task explicit approval; list-task standing approval SA1) |
| `baselines/` | 3 (one per started ticket) |
| `verifications/` | 4 V: 3 pass, 1 fail (expected TDD red) |
| `approvals/` | 2 A: manifest approval + requirements-baseline approval |
| `reviews/` | 2 R (independent, fresh-session) |
| `decisions/` | 1 ADR: JSON-file storage, two-way |
| `events/` | 23 events, chronological, full lifecycle discovery → implementation |
| `environment/` | 3 verified facts with evidence |
| `lessons/`, `blockers/`, `evidence/T-x4kq-add-task/` | 1 each |

`gates.md`, `lanes.md`, `safety.md`, `protected.md`, `workflow-map.md`,
`CHEATSHEET.md` are the init policy files with todo-notes values filled in.
`STATE.md` is the derived view (invariants, phase, edit lock, ticket board,
`built_from`, next action).

## Timeline

20261108 discovery (4 Q, gate) → requirements (4 REQ, baseline approval, gate)
→ tickets (5 T, coverage, gate) → 20261109 planning (ADR, env facts, gate) →
implementation (bootstrap done, add-task done) → 20261110 list-task started,
human blocker raised.

## Usage in evals

Copy this folder as the starting state for scenarios; reset `STATE.md` fields
(e.g. `phase`) where a scenario says so. Records follow
`src/format-spec.md` (front matter, `A-Z1-5-<4 crockford>-<slug>` IDs,
`YYYYMMDDTHHMMSSZ` timestamps, event filename convention). Validate with:
`python tools/validate.py evals/golden-project` (expect PASS; one accepted warning).
