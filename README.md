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

1. Initialize Agentflow in your project (zero dependencies, never overwrites existing files):
   ```bash
   npx github:GurunathJadhav/ADM-TOOL init <your-project>
   # or from a local clone:
   node bin/agentflow.js init <your-project>
   ```
   Manual procedure: `INSTALL.md`.
2. **Antigravity CLI users:** Run `/skills reload` once so `.agents/skills/af-*` appear as native slash commands.
3. In your agent, run `/af-start` (or `"follow AGENTS.md"`). The agent probes its tier, confirms your mode (`rapid` / `balanced` / `strict`), and starts focused discovery.
4. Full walkthrough: `docs/quickstart.md`.

## Repository layout

```
bin/
  agentflow.js        zero-dependency Node CLI (init, install, loop, doctor, validate, uninstall)
src/
  format-spec.md      authoritative record schema (front matter, IDs, timestamps)
  init/               policy + state files installed into a project's .agentflow/
  templates/          one Markdown template per record type
  commands/           54 command prompt files (/af-*)
  skills/             35 skills (router, frontend-and-ui-craft, tdd-implementation, lean-architecture, ...)
  adapters/           AGENTS.md / CLAUDE.md / antigravity / generic fallback (managed blocks)
  profiles/           per-project-type question banks and defaults (7 profiles)
docs/                 quickstart, concepts, adapter guide, custom skills, enforcement limits
evals/                golden example project + bad-behaviour scenarios (S19)
tools/
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
