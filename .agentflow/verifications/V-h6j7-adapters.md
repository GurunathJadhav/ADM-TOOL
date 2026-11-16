---
type: verification
id: V-h6j7-adapters
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T154714Z
actor: agent
role: agent
ticket_id: none
criterion_id: S13-adapter-verification
method: document-review
result: pass
evidence_ref: environment/F-b8c9-claude-code.md, F-d0e1-opencode.md, F-e2f3-cursor.md, F-g4h5-antigravity.md
---
# Verification: adapter formats against official docs (S13 standing task)

- **Claude Code** — verified (docs fetched 2026-11-17). Outcome: CLAUDE.md adapter must use an
  `@AGENTS.md` import because Claude reads only CLAUDE.md when both exist. Adapter + installer
  updated accordingly.
- **OpenCode** — verified. AGENTS.md is primary; `opencode.json` `instructions` wires extra files.
- **Cursor** — verified. AGENTS.md native; `.cursor/rules/` accepts only `.mdc` (plain `.md` ignored).
- **Antigravity** — verified. AGENTS.md native always-on; optional `.agents/rules/*.md` with `trigger:`.
- **Could not confirm (unverified):** Codex, Windsurf, Cline, Copilot agent mode — marked UNVERIFIED
  in docs/adapter-guide.md; generic AGENTS.md fallback remains the only supported path for them.
