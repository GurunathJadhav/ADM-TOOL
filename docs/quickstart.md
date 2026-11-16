# Agentflow Quickstart

Agentflow is a markdown-file-based operating system for AI coding agents: it forces requirement clarification, user-story tickets, approved edit manifests, and evidence-backed verification before any code is trusted. It works with any agent (Claude Code, OpenCode, Cursor, Codex, and others) or plain chat, and all project state lives in one project-local `.agentflow/` folder.

## Install (copy, non-destructive)

The framework is a read-only template and skill pack. Installing it never overwrites your files:

1. Copy the Agentflow files into your project root (installer or manual copy). Existing files such as `AGENTS.md` or `CLAUDE.md` are **not** overwritten — the installer appends a clearly marked managed block (`<!-- agentflow:begin v1.0.0 -->` … `<!-- agentflow:end -->`). Re-running updates only that block.
2. Optional: run the installer's **dry-run** first — it lists exactly what it would create or change, and nothing else.
3. Existing project rules are preserved; conflicts with Agentflow rules are listed for you to decide.

Uninstall removes only the managed blocks and the `.agentflow/` folders.

## Start

In your agent, type:

```
/af-start
```

What happens:

1. **Tier declared.** The agent tests what it can actually do (write a file? run a command? hooks available?) and declares **Tier 0** (chat/file only), **Tier 1** (can run commands), or **Tier 2** (hooks/CI/MCP). It records the tier in `.agentflow/environment/`.
2. **Defaults sheet proposed.** The agent proposes defaults (strictness, discovery depth, edit budgets, lanes, protected paths) and asks you to approve them in one reply. Nothing is created before you approve.
3. **Discovery interview.** After you approve, `project.md` is created, then `/af-ask` starts: up to 5 questions at a time, blocking questions first, each with a recommended default. You may reply "accept defaults" for non-critical ones.

## The 8 core commands

| Command | Purpose |
|---|---|
| `/af-start` | Initialize the project: declare tier, propose defaults, create `project.md` |
| `/af-next` | Inspect state and recommend the single next valid command, with reason |
| `/af-ask` | Ask blocking clarification questions (max 5 at a time) |
| `/af-ticket` | Create a user-story ticket with testable Given/When/Then criteria |
| `/af-verify` | Run the verification command and record evidence in a V-record |
| `/af-done` | Complete the active ticket after clean diff, regression, and review |
| `/af-status` | Show phase, edit lock, active ticket, blockers, next action |
| `/af-help` | Help on commands, rules, and recovery |

All other commands (54 total) are **advanced** and listed in `.agentflow/CHEATSHEET.md`; `/af-next` routes you to them when needed.

## What appears under `.agentflow/`

```
.agentflow/
  project.md STATE.md CHEATSHEET.md workflow-map.md      # policy + derived state
  gates.md lanes.md safety.md protected.md               # policy files
  questions/ events/ decisions/ tickets/ manifests/       # one file per record
  baselines/ verifications/ approvals/ claims/ blockers/
  reviews/ requirements/ glossary/ risks/ lessons/
  environment/ waivers/ evidence/ skills/ commands/ templates/
```

One file per record (tickets `T-…`, questions `Q-…`, approvals `A-…`, verifications `V-…`, …). Status is derived from `events/`, never edited into place.

## The footer

Every reply that changes state ends with:

```
Done: <produced> | Logged: <event ids> | Next: <command> because <reason> | Needs you: <questions/approvals or "nothing">
```

This tells you what was produced, what was logged, the exact next command, and everything waiting on you. `APPROVALS-NEEDED.md` collects all pending approvals in one place.

## Your first hour

1. **Minutes 0–10:** Install, run `/af-start`, approve (or edit) the defaults sheet. Note the declared tier.
2. **Minutes 10–40:** Answer `/af-ask` questions (accept defaults where fine). Then `/af-confirm-understanding`, `/af-requirements` for the scope baseline, `/af-ticket` per feature, and `/af-gate` at each phase exit. The owner (you) approves each phase advance.
3. **Minutes 40–60:** `/af-next` routes you to `/af-edit-plan` for the first ticket's Edit Manifest — the exact files the agent may touch, which you approve — then `/af-start-ticket`, and the agent works in small verified steps (`/af-verify` after each). Each step is one logical change with pasted command output as evidence.

If you stop at any point, `/af-pause` writes a handoff; next session, `/af-resume` (or pasting `STATE.md` in a chat agent) continues with zero memory loss.

**Honest note:** Tier 0 (plain chat) and instruction-level rules cannot technically block an edit — they guide the agent, and you reject bad output. See `docs/limits-of-enforcement.md`.
