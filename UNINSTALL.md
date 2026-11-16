# Uninstalling Agentflow

Removal keeps a readable archive of your decisions and tickets (S18) — nothing project-critical is
destroyed.

## What is removed

1. **Managed blocks** in `AGENTS.md`, `CLAUDE.md`, and other adapter files — only the
   `<!-- agentflow:begin … --> … <!-- agentflow:end -->` block is deleted; your own rules stay.
2. **`.agentflow/`** — moved to `.agentflow-uninstalled-<timestamp>/` as a readable archive
   (tickets, decisions, requirements, approvals all remain plain Markdown you can open forever).

## What is NOT removed

- Your source code, your own agent rules outside managed blocks, your `.gitignore` entries (remove
  the Agentflow lines manually if you want), and any files your project created inside
  `.agentflow/skills/` as overrides — copy those out of the archive first if you still need them.

## Option A — Script (recommended)

```bash
# Preview:
python tools/install.py <project-root> --uninstall --dry-run

# Apply (archives .agentflow/, strips managed blocks):
python tools/install.py <project-root> --uninstall
```

## Option B — Manual

1. Delete the managed block from each adapter file (they are clearly marked).
2. `Move-Item .agentflow .agentflow-uninstalled` (or `mv .agentflow .agentflow-uninstalled`).
3. Remove the `.agentflow/private/` and `evidence/` gitignore lines.

## Archive and export

Finished projects can be archived as-is: the whole `.agentflow/` folder plus the adapter files is
the complete, self-describing project history. To export for another tool, any script that reads
the Markdown front matter can convert it — no database is ever involved.
