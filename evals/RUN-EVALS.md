# Run Evals — how to run the Agentflow eval suite (S19)

## What is here

- `golden-project/` — golden example state (copy per run; `src/` is deliberately
  absent; fixture shows process state, not code).
- `scenarios/SCN-01…12-*.md` — bad-behaviour scenarios (each must be refused or
  flagged).
- `scenarios/guidance-fixtures.md` — 54 state→command fixtures + 6 wrong-command
  refusals.

## Running a scenario

1. Copy `evals/golden-project` to a scratch workspace; apply the scenario's
   Setup State (mutate `STATE.md`, remove/add records as stated).
2. Install the framework under test (`tools/install.py` adapter) into the
   workspace.
3. Feed the Scripted User Messages verbatim, one per turn; do not paraphrase.
4. Collect the transcript and the workspace diff (files before/after).
5. Apply the Pass Criterion; fill `grader_id` in the scenario file.
6. Run each scenario ≥3 times per agent (S19); report per-scenario pass rates,
   not a single average — non-determinism hides in individual runs.

## Agents to test

- At least two agents, including one smaller/weaker model.
- One Tier 0 chat-only flow (no filesystem: agent emits `FILE:` paste-back
  blocks; graders apply criteria to the pasted files and transcript).
- Record model id and adapter per run in the results table.

## When a weak model fails

Simplify the rule, don't add text: shorten the skill, add a worked example,
tighten the template (S19). A rule that a weak model cannot follow after
simplification goes to the owner for pruning or redesign (S18 usage-driven
pruning). Never patch eval failures by prompt-stuffing the adapter.

## Results table template

| Scenario | Agent A (n=3) | Agent B weak (n=3) | Tier 0 flow (n=3) | Notes |
|----------|---------------|--------------------|-------------------|-------|
| SCN-01   | 3/3           | 2/3                | 3/3               |       |

## Compatibility matrix (dated)

| Agent / model | Auto-loads skills | Honours hooks | Slash commands | Pre-edit hooks | Permission options |
|---------------|-------------------|---------------|----------------|----------------|--------------------|
| <agent A>     | verified          | unverified    | verified       | unverified     | verified           |
| <agent B>     | unverified        | unverified    | verified       | unverified     | unverified         |

Every cell starts `unverified`; flip to `verified` only after a run proves the
feature (S13, S19). Record the date and the agent version next to the table.
Auto-approve-everything modes must be off; document that bypass modes
undermine the human approvals the framework relies on.

## Honest reporting

- Report overhead against a baseline golden-project run *without* the
  framework: extra turns, tokens (labelled approximate), wall-clock, and human
  approval interruptions per ticket.
- Report failures verbatim (which rule, which step) — not just counts.
- Where verification commands could not run in the eval environment, mark the
  criterion `unverified` rather than assuming success.
- Keep per-ticket metrics: approximate tokens/effort, rework loops, scope flags
  (`/af-report --metrics`).

## Known accepted findings

- `tools/validate.py` on `golden-project` returns PASS (exit 0) with one
  warning: `Q-8x3k-storage-format` carries `blocking: true` (answered, but the
  validator cannot derive question status from events). Treat the warning as
  expected when grading fixture-based runs.
- Prior fixture generations are kept for reference: `evals/golden-project-previous/`
  and the `scenarios/bad-behaviour`, `scenarios/wrong-command`,
  `scenarios/state-fixtures` sets from earlier runs.
