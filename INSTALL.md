# Installing Agentflow

Two paths: the **manual procedure** (primary, works anywhere) and the **optional installer script**.
Both are non-destructive and repeatable. Re-running never overwrites existing files — existing
project rules are preserved; conflicts are listed for you to decide.

## Path A — Manual procedure

1. **Dry run (optional):** list what will be created. Nothing below touches existing files except
   the managed blocks in step 4.
2. **Create `.agentflow/`** in the project root with these subdirectories:
   `questions/ events/ decisions/ tickets/ manifests/ baselines/ verifications/ approvals/ claims/
   blockers/ reviews/ requirements/ glossary/ risks/ lessons/ environment/ waivers/ evidence/
   handoff/ spikes/ private/(gitignored) profiles/ stacks/ skills/ commands/ templates/`
3. **Copy framework files** from this repository into `.agentflow/`:
   - `src/init/*.md` → `.agentflow/` (project.md, gates.md, lanes.md, safety.md, protected.md,
     workflow-map.md, STATE.md, CHEATSHEET.md)
   - `src/templates/*` → `.agentflow/templates/`
   - `src/skills/*` → `.agentflow/skills/`
   - `src/commands/*` → `.agentflow/commands/`
   Skip any file that already exists in the target — project copies override shared ones (and the
   override is visible/logged).
4. **Adapters (managed blocks only):** append to `AGENTS.md` (and optionally `CLAUDE.md`) the block
   from `src/adapters/AGENTS.md`, wrapped in
   `<!-- agentflow:begin v1.0.0 -->` … `<!-- agentflow:end -->`.
   This is the one permitted automated edit to those files. If a block already exists, update only
   that block. Never overwrite your own rules.
5. **Gitignore:** ensure `.agentflow/private/` and large raw `evidence/` files are ignored. Warn:
   committed records can contain business-sensitive requirements — public repos need a review of
   `requirements/`, `decisions/`, `evidence/` first.
6. **Stamp the version:** `project.md` carries `framework_version`; update it on upgrades.

## Path B — Optional installer script (Python 3, zero dependencies)

```bash
# Preview exactly what would be created or changed:
python tools/install.py <project-root> --dry-run

# Install:
python tools/install.py <project-root>
```

The script creates a fresh blank `.agentflow/`, copies templates/skills/commands where missing,
appends managed blocks to `AGENTS.md`/`CLAUDE.md`, and adds a recommended `.gitignore` only if you
have none. Existing files are never overwritten; re-runs update only the managed block.

## After install

1. Open your agent (Claude Code, OpenCode, Cursor, Codex, Windsurf, Cline, Copilot agent mode, or
   plain chat) and run `/af-start` or say "follow AGENTS.md".
2. The agent tests what it can do (write a file? run a command?), declares its **tier**, and
   proposes a **defaults sheet** for you to approve — this creates `project.md`.
3. Per-agent permission guidance: `docs/adapter-guide.md`. Keep "auto-approve everything" modes
   OFF — bypass modes undermine human approvals.

## Uninstall

`python tools/install.py <project-root> --uninstall` (archives `.agentflow/` as a readable folder,
removes only managed blocks), or follow `UNINSTALL.md`.
