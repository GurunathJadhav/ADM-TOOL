# Adapter Guide

Agentflow works through thin per-agent adapter files. Each exposes the same core commands (`/af-start`, `/af-next`, `/af-ask`, `/af-ticket`, `/af-verify`, `/af-done`, `/af-status`, `/af-help`) and the footer rule. The installer is non-destructive: it appends a managed block (`<!-- agentflow:begin v1.0.0 -->` … `<!-- agentflow:end -->`) and re-running updates only that block.

> **Verify adapter formats against official docs before generating.** Do not rely on memory for any tool's conventions. Before generating or updating an adapter, verify the tool's current format and options from its official documentation, and record it:
>
>   ```
>   FILE: .agentflow/verifications/V-<id>-adapter-<tool>.md
>   ---
>   type: verification
>   subject: <tool> adapter format
>   tool_version: <version>
>   last_verified: <YYYY-MM-DD>
>   ---
>   - Checked: <official docs URL / docs source>
>   - Confirmed: <file locations, front-matter format, command mechanism, permission options>
>   - Could not confirm: <list anything unverified>
>   ```
> `doctor` warns when an adapter is older than a set period; re-verification is a standing task before each release.

## Claude Code

*Verified against official docs 2026-11-17 (code.claude.com/en/docs/claude-code/memory).*
- **Files:** the installer creates both `AGENTS.md` (canonical managed block) and `CLAUDE.md` (managed block containing an `@AGENTS.md` import). When a repo has both, Claude Code reads **only `CLAUDE.md`** by default, so the import — not a prose pointer — is what loads the Agentflow rules. Claude Code ≥ v2.1.277 can also read `AGENTS.md` directly (configurable via `/config` → Project instructions → `claude-md-and-agents-md`).
- **Commands/skills:** commands live in `.agentflow/commands/<name>.md`; mirror into `.claude/commands/` for native slash commands. Skills go in `.claude/skills/`. Optional path-scoped reminders can use `.claude/rules/*.md` (optional `paths:` front matter).
- **Limits:** `CLAUDE.md` is context, not enforced configuration — hard blocking needs PreToolUse hooks (Tier 2). Keep instruction files short (docs recommend under ~200 lines).
- **Recommended permissions:** auto-approve / bypass modes **OFF** (never `--dangerously-skip-permissions`); require confirmation for shell commands outside the allowlist; reject writes outside the approved Edit Manifest.

## OpenCode

*Verified against official docs 2026-11-17 (opencode.ai/docs/rules).*
- **Files:** `AGENTS.md` in the project root is the primary rules mechanism (wins over `CLAUDE.md` in the same category). Extra instruction files can be wired via `opencode.json` → `"instructions": [...]` (supports globs, e.g. `".agentflow/commands/*.md"`), which is the recommended way to expose command files.
- **Compatibility:** OpenCode also honours Claude Code conventions as fallbacks (`CLAUDE.md`, `~/.claude/CLAUDE.md`, `~/.claude/skills/`); disable with `OPENCODE_DISABLE_CLAUDE_CODE=1` if unwanted.
- **Recommended permissions:** confirm shell commands outside the allowlist; confirm writes outside the manifest where supported; auto-approve-everything **OFF**.

## Cursor

*Verified against official docs 2026-11-17 (cursor.com/docs/context/rules).*
- **Files:** Cursor reads `AGENTS.md` from the project root (and nested subdirectories) natively — the canonical managed block is enough. Optional `.cursor/rules/*.mdc` files exist for path-scoped rules; **plain `.md` files inside `.cursor/rules/` are ignored** (only `.mdc` with `description` / `globs` / `alwaysApply` front matter is recognised). If used, `.mdc` files hold wiring only, never project data.
- **Recommended permissions:** confirm shell commands outside the allowlist; reject writes outside the manifest; any "auto-run / yolo" mode **OFF**.

## Antigravity

*Verified against official docs 2026-11-17 (antigravity.google/docs/rules).*
- **Files:** Antigravity loads `AGENTS.md` (or `GEMINI.md`) from the workspace folder and parent folders up to the repository root — always-on, no frontmatter needed, so the canonical managed block is enough. Optional modular rules go in `.agents/rules/*.md` with a required `trigger:` front matter key (`always_on | model_decision | glob | manual`); a skills-style router rule can be exposed as `trigger: model_decision`. Rules are capped at 24 KB per file.
- **Recommended permissions:** same baseline — shell outside allowlist confirmed, writes outside manifest confirmed where supported, auto-approve-everything **OFF**.

## Codex / Windsurf (Devin Desktop) / Cline / Copilot agent mode

*Verified against official docs 2026-11-17.*
- **Codex** (developers.openai.com/codex): reads `AGENTS.md` natively — global `~/.codex/AGENTS.md`, then project root walking down to the working directory (one file per directory, `AGENTS.override.md` wins). Combined instructions cap at 32 KiB (`project_doc_max_bytes`); keep the managed block concise. The canonical managed block is sufficient.
- **Windsurf → Devin Desktop** (docs.windsurf.com now redirects to docs.devin.ai): `AGENTS.md`, `AGENTS.local.md`, and `AGENT.md` at the workspace root (and parent directories down to the working directory) are always-on rules. `.devin/rules/*.md` with `trigger:` front matter (`always_on | glob | model_decision | manual`) is the modular form; legacy `.windsurfrules` and `.windsurf/rules/*.md` are still imported by default. Skills live in `.devin/skills/<name>/SKILL.md` (`.agents/skills/` and legacy `.windsurf/skills/` also read).
- **Cline** (docs.cline.bot): reads `AGENTS.md` at the project root and `~/.agents/AGENTS.md` globally. Optional `.clinerules/` (or `.cline/rules/`) directories hold per-topic rule files with optional `paths:` front matter for path-scoped activation; rules are individually toggleable.
- **Copilot agent mode** (docs.github.com/copilot): reads `AGENTS.md` files stored anywhere in the repository (nearest file in the directory tree takes precedence); also supports repo-wide `.github/copilot-instructions.md` and path-specific `.github/instructions/NAME.instructions.md` with `applyTo:` front matter. The canonical `AGENTS.md` block is sufficient.

**Recommended permissions (all four):** confirm shell commands outside the allowlist; confirm writes outside the manifest where the tool supports it; auto-approve-everything / full-auto modes **OFF**.

## Tier 0 plain-chat usage (paste-back protocol)

For chat-only agents with no filesystem access (ChatGPT, Claude Web, Gemini Web, Copilot Chat):

1. **Kickoff:** you paste `.agentflow/STATE.md` into the chat and say you are working under Agentflow governance.
2. **Agent output:** the agent never produces loose code edits — every new or changed file is emitted as a labelled block, changed files only:
   ```
   FILE: .agentflow/tickets/T-x4kq-auth.md
   ---
   type: ticket
   ...
   ```
   When state changes, the updated `STATE.md` is emitted as the **final** file block, and the reply ends with the footer.
3. **You save** each block to the given path on disk; next session, paste the latest `STATE.md` again.

Tier 0 cannot technically block an edit: the protocol guides the agent, and you reject output that violates it. See `docs/limits-of-enforcement.md`.

## Universal permission rule

Auto-approve-everything and bypass modes **undermine human approvals**. Agentflow's approvals (`/af-edit-plan` manifests, phase gates, countersigns) are only as strong as the tool's permission configuration: if the tool auto-runs every command and write, no approval is actually collected before action.
