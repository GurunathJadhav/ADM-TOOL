---
type: environment
id: F-b8c9-claude-code
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T154710Z
actor: agent
role: agent
fact_name: claude-code-agent-md-format
value: "Claude Code reads CLAUDE.md (./CLAUDE.md or ./.claude/CLAUDE.md) and, when both CLAUDE.md and AGENTS.md exist, reads only CLAUDE.md by default; CLAUDE.md must import AGENTS.md via @AGENTS.md. Direct AGENTS.md reading requires v2.1.277+."
label: verified
evidence_ref: https://code.claude.com/en/docs/claude-code/memory (fetched 2026-11-17)
---
# Verified fact: Claude Code instruction-file format

- `.claude/rules/*.md` with optional `paths:` front matter is supported for path-scoped rules.
- `CLAUDE.md` is context, not enforced configuration; hard blocking needs PreToolUse hooks (Tier 2).
