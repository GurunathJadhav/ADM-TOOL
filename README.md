# Agentflow

A reusable, project-isolated, **agent-agnostic framework** that acts as adviser, guide, and process
enforcer for AI coding agents — so any agent builds applications with clarified requirements,
user-story tickets, evidence-based claims, and minimal justified design.

Everything is **Markdown**. No database, no network calls, no telemetry. Works in plain chat
(Tier 0), with command access (Tier 1), or with hooks/CI/MCP (Tier 2).

## What it enforces (and honestly can't)

| Agent failure | Agentflow countermeasure |
|---|---|
| Guessing requirements | Discovery interview + blocking-question gate before any code |
| Hallucinating APIs/files/packages | Verify-before-use checklist + confidence labels (verified/inferred/unknown) |
| Over-engineering | Simplicity gate + Complexity Budget |
| Editing unrelated code | Edit Manifest: anything not listed is forbidden |
| Weakening tests | Test-integrity rules + independent reviewer re-runs commands |
| Losing context between sessions | Event log + rebuildable `STATE.md` + handoff records |

**Honest limit:** only Tier 2 (hooks/CI) can technically block an edit. Instruction-level rules can
be bypassed by an agent with unrestricted file access; user-owned commits, independent review, and
CI are the real backstop. See `docs/limits-of-enforcement.md`.

## Workflow Modes (`strictness`)

Pick the pace that matches your project during `/af-start`:
- **`rapid`** — Fast MVPs, solo tools & prototypes: 3 stages (*Align → Build Vertical Slices → Verify & Ship*), slice-level verification + live runtime smoke test, solo self-review.
- **`balanced` (default)** — Production apps without paperwork bloat: cohesive vertical slices (component + styles + tests together), standing approvals for `src/` + tests, live app runtime verification.
- **`strict`** — Enterprise / compliance: full 9-phase governance, 1-file edit steps, mandatory independent review per ticket.

## Quick start

1. Initialize Agentflow in your project (zero dependencies, never overwrites existing files, and automatically initializes a `git` repository if one isn't present):
   ```bash
   npx github:GurunathJadhav/ADM-TOOL init <your-project>
   # or from a local clone:
   node bin/agentflow.js init <your-project>
   ```
   Manual procedure: `INSTALL.md`.
2. **Antigravity CLI users:** Run `/skills reload` once so `.agents/skills/af-*` appear as native slash commands.
3. In your agent, run `/af-start` (or `"follow AGENTS.md"`). The agent probes its tier, confirms your mode (`rapid` / `balanced` / `strict`), and starts focused discovery.
4. Full walkthrough: `docs/quickstart.md`.

## Clean-Context Build Loop (Zero Context Pollution)

Once discovery, requirements, and tickets are ready, don't build inside a noisy planning chat:
```bash
node .agentflow/build.js        # or: agentflow build .
# Generates .agentflow/BUILD-BRIEF.md (<1k tokens) + .agentflow/BUILD-PROMPT.txt
```
Open a **brand-new clean AI session**, paste the generated loop prompt, and the agent builds ticket batches (`edit-plan → start-ticket → vertical slice → /af-verify + live smoke → report.js → /af-done → build.js`) with sharp focus and automatic context rotation.

## Live HTML Project Status Dashboard

Every installed project gets a self-contained visual dashboard at `.agentflow/report.html` powered by `.agentflow/report.js` (zero dependencies, works offline):
- **MVPs & User Stories:** Completion progress by MVP wave (`MVP-1` / MoSCoW) and status donut/pie charts
- **Timings & Tokens:** Grouped bar charts comparing estimated vs actual duration and approximate token consumption per ticket
- **Quality & Activity:** Verification (`V-*`), review (`R-*`), blocker/risk counters, rework rate, and searchable ticket table
- Refresh anytime with `node .agentflow/report.js` or `agentflow report .`

## Token-Saving Python Automation Scripts & Safety

Every installed project receives zero-dependency Python helpers in `.agentflow/scripts/` (plus optional POSIX `.git/hooks/` via `--hooks`):
- `.agentflow/scripts/af_records.py` — `env-probe`, single/batch `req` & `ticket`, `plan` (manifest), `start`, `question`, `decision`, `approval`, `state-rebuild`
- `.agentflow/scripts/af_test_runner.py` — `scaffold` starter tests, `verify` (tests + evidence + `V-*.md`), `diff-check` (manifest + secret/debug hygiene), and `smoke` (HTTP / artifact / DOM smoke probe)
- `.agentflow/scripts/af_gate_runner.py` — deterministic `next` router, `coverage` (`traceability.md`), `check-gate`, `advance-gate`, `close-ticket`, and `commit` (built-in secret scan + `[T-xxxx]` tag)

## Repository layout

```
bin/
  agentflow.js        zero-dependency Node CLI (init, install, build, report, loop, doctor, validate, uninstall)
src/
  format-spec.md      authoritative record schema (front matter, IDs, timestamps)
  init/               policy + state files installed into a project's .agentflow/
  templates/          one Markdown template per record type
  commands/           55 command prompt files (/af-*)
  skills/             38 skills (router, python-script-automation, clean-context-build-loop, project-status-dashboard, frontend-and-ui-craft, ...)
  adapters/           AGENTS.md / CLAUDE.md / antigravity / generic fallback (managed blocks)
  profiles/           per-project-type question banks and defaults (7 profiles)
docs/                 quickstart, concepts, adapter guide, custom skills, enforcement limits
evals/                golden example project + bad-behaviour scenarios (S19)
tools/
  scripts/            token-saving Python automation scripts (af_records.py, af_test_runner.py, af_gate_runner.py)
  agentflow-build.js  clean-context BUILD-BRIEF.md & fresh-session loop prompt generator
  agentflow-report.js zero-dep live HTML + SVG charts status dashboard generator
  install.py          optional Python installer (dry-run, managed blocks)
  validate.py         optional Tier-1 validator (Python, zero dependencies)
  agentflow-loop.js   interactive blocking-question terminal loop
  agentflow-gate.js   pre-edit gate checker
```

## Core commands (8 of 54)

`/af-start` `/af-next` `/af-ask` `/af-ticket` `/af-verify` `/af-done` `/af-status` `/af-help`
— all others are advanced and reachable via `/af-next`; see `.agentflow/CHEATSHEET.md`.

## Complexity budget (self-enforced, S18)

`AGENTS.md` ≤ ~60 lines · each skill ~1 page · 8 visible core commands · `STATE.md` under its
~1,000-token cap · zero code dependencies in the core · validator is one dependency-free script.

## Status

- v1.0.0 — protocol, templates, commands, skills, adapters, profiles, docs, installer, validator.
- Licensed **MIT** (owner decision 2026-11-17, `LICENSE`).
- Pending before publishing: real-agent eval runs (≥3 per scenario, ≥2 agents incl. a weaker
  model) and compatibility-matrix cells marked verified.
