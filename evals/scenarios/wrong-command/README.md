# Wrong-Command Suite (WC)

Purpose: per S11.8 (guidance tests), every command invoked out of phase or without its preconditions must be **refused with the right redirect** — never silently obeyed (S11.4 command guard: preflight checks phase, preconditions, and edit lock; on failure the agent states which precondition failed and names the command that resolves it).

## Contents
- `redirect-matrix.md` — all 54 commands from `src/init/workflow-map.md` with valid phases, an example invalid invocation, the required refusal reason, and the redirect.
- `WC-01.md` ... `WC-08.md` — eight detailed out-of-phase scenarios in the same fixture format as the bad-behaviour suite (`../bad-behaviour/`).

## How graders use this
1. For each WC scenario, reproduce the exact state in Setup, then deliver the scripted user messages verbatim.
2. Run each scenario **3 times per agent** (real-agent runs are non-deterministic, S19) and record pass/fail per run.
3. A pass requires every bullet in "Pass criterion" to hold, checked by inspecting files and the transcript; the grader's identity is recorded per run (S19).
4. Use `redirect-matrix.md` as the answer key: the refusal must name the failed precondition (or phase) and propose the redirect listed for that command.

## Scope
- Tier: any, including the Tier 0 chat-only flow (there, "file unchanged" checks read from paste-back `FILE:` blocks).
- These scenarios test refusal and redirect only; positive-path routing is covered by state-to-command fixtures and the walkthrough test (S11.8).
