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

## Quick start

1. Copy the framework into your project (never overwrites existing files):
   `python tools/install.py <your-project> --dry-run` then without `--dry-run`.
   Manual procedure: `INSTALL.md`.
2. In your agent, run `/af-start` (or "follow AGENTS.md"). The agent declares its tier, proposes a
   defaults sheet for your approval, and starts the discovery interview.
3. Full walkthrough: `docs/quickstart.md`.

## Repository layout

```
src/
  format-spec.md      authoritative record schema (front matter, IDs, timestamps)
  init/               policy + state files installed into a project's .agentflow/
  templates/          one Markdown template per record type
  commands/           54 command prompt files (/af-*)
  skills/             34 skills, including the using-agentflow router
  adapters/           AGENTS.md / CLAUDE.md / generic fallback (managed blocks)
  profiles/           per-project-type question banks and defaults (7 profiles)
docs/                 quickstart, concepts, adapter guide, custom skills, enforcement limits
evals/                golden example project + bad-behaviour scenarios (S19)
tools/
  install.py          optional non-destructive installer (dry-run, managed blocks)
  validate.py         optional Tier-1 validator (Python, zero dependencies)
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
