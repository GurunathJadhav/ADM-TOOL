---
type: environment
id: F-i7k8-generic-agents
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T154900Z
actor: agent
role: agent
fact_name: codex-windsurf-devin-cline-copilot-agents-md
value: "All four read AGENTS.md natively. Codex: global ~/.codex/AGENTS.md + project walk-down, 32 KiB cap, AGENTS.override.md wins. Windsurf=Devin Desktop: AGENTS.md/AGENTS.local.md always-on, .devin/rules/*.md with trigger frontmatter, legacy .windsurfrules imported. Cline: project AGENTS.md + ~/.agents/AGENTS.md, optional .clinerules/ with paths frontmatter. Copilot: AGENTS.md anywhere in repo (nearest wins), .github/copilot-instructions.md repo-wide, .github/instructions/*.instructions.md path-specific with applyTo."
label: verified
evidence_ref: developers.openai.com/codex/agent-configuration/agents-md; docs.devin.ai/desktop/local-customizations; docs.cline.bot/features/cline-rules; docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions (all fetched 2026-11-17)
---
# Verified fact: AGENTS.md is native for Codex, Windsurf/Devin, Cline, and Copilot

- Every supported agent in the compatibility set reads `AGENTS.md` natively; the single canonical
  managed block covers them all. Per-agent extras (`.mdc` rules, `.clinerules/`, `copilot-instructions.md`)
  are optional wiring, never project data.
- **Windsurf is now Devin Desktop** (docs.windsurf.com redirects to docs.devin.ai); legacy
  `.windsurfrules`/`.windsurf/rules/` still load by default.
