# Agentflow Non-Destructive Installation & Adapter Integration Guide
<!-- Document: src/adapters/installer.md — Specification and manual procedure for repeatable, non-destructive bootstrap. -->

This guide defines the standard non-destructive bootstrap procedure for Agentflow v1.0.0. The installation process ensures that no existing project files are overwritten, existing agent guidelines are preserved, and all framework rules are installed cleanly via managed blocks.

---

## 1. Principles & Guarantees

1. **Non-Destructive Guarantee:** Never delete or overwrite an existing file without explicit human authorization.
2. **Managed Block Isolation:** All agent adapter modifications occur strictly inside standard managed block markers:
   ```markdown
   <!-- agentflow:begin v1.0.0 -->
   ... adapter content ...
   <!-- agentflow:end -->
   ```
3. **Idempotence & Re-runnability:** Running the installation multiple times is safe. Re-running updates only the content inside managed blocks and never alters surrounding user instructions.
4. **Preservation of Existing Rules:** Pre-existing project guidelines, coding style guides, or linter configs in files like `AGENTS.md`, `CLAUDE.md`, or `.cursor/rules/*` remain completely intact.
5. **Conflict Surfacing:** Any conflicting project instructions (e.g. autonomous commit directives) are surfaced directly to the human user for a documented decision.
6. **Clean Uninstallation:** Every change made by Agentflow can be cleanly rolled back by removing the managed blocks and optionally archiving the `.agentflow/` governance directory.

---

## 2. Step 1: Pre-Flight Checks

Before making any disk modifications, perform the following verification steps:

### 2.1 Git Status Check
Verify that the project working tree is clean:
```powershell
git status --porcelain
```
*Recommendation:* If there are uncommitted changes, advise the user to commit or stash them before proceeding so that installation changes can be reviewed in an isolated git diff.

### 2.2 Detect Existing Agentflow Installation
Check if an `.agentflow/` directory already exists:
- If `.agentflow/` does **not** exist: Proceed with a fresh bootstrap.
- If `.agentflow/` **already exists**: Read `.agentflow/project.md` to inspect `framework_version` and `schema_version`.
  - If the version matches `1.0.0`: The operation is an idempotency refresh.
  - If the version is earlier: Follow the migration checklist in `MIGRATING.md`.

### 2.3 Detect Existing Agent Files
Inspect the project root and IDE directories for pre-existing files:
| Target Agent | Target File Path | Detected Status |
| :--- | :--- | :--- |
| **Canonical** | `AGENTS.md` | Existing / Absent |
| **Claude Code** | `CLAUDE.md` | Existing / Absent |
| **Cursor** | `.cursor/rules/agentflow.mdc` | Existing / Absent |
| **Windsurf** | `.windsurfrules` | Existing / Absent |
| **Cline** | `.clinerules` | Existing / Absent |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Existing / Absent |
| **Aider** | `.aider.conf.yml`, `.aider.conventions.md` | Existing / Absent |
| **Google Antigravity** | Workspace root `AGENTS.md` | Existing / Absent |

---

## 3. Step 2: Dry-Run Mode

Before writing files, emit a Dry-Run Plan for human inspection:

```markdown
### Agentflow Installation Dry-Run Plan
- **Target Repository:** <absolute_path>
- **Target Version:** 1.0.0
- **Directories to Create:**
  - .agentflow/
  - .agentflow/tickets/
  - .agentflow/events/
  - .agentflow/evidence/
  - .agentflow/templates/
  - .agentflow/skills/
  - .agentflow/commands/
  - .agentflow/claims/
  - .agentflow/lessons/
  - .agentflow/environment/
  - .agentflow/profiles/
  - .agentflow/stacks/
- **Files to Copy:**
  - Policy files: src/init/* -> .agentflow/
  - Templates: src/templates/* -> .agentflow/templates/
  - Commands: src/commands/* -> .agentflow/commands/
  - Skills: src/skills/* -> .agentflow/skills/
- **Adapters to Install / Update:**
  - AGENTS.md: [Create new | Inject managed block | Update managed block]
  - CLAUDE.md: [Create new | Inject managed block | Update managed block]
  - .cursor/rules/agentflow.mdc: [Create new | Update]
  - .windsurfrules: [Create new | Inject managed block | Update managed block]
  - .clinerules: [Create new | Inject managed block | Update managed block]
  - .github/copilot-instructions.md: [Create new | Inject managed block | Update managed block]
  - .aider.conventions.md: [Create new | Inject managed block | Update managed block]
```

Request user approval before proceeding to physical file writes.

---

## 4. Step 3: Create Directory Structure

Execute creation of the core governance hierarchy:

```powershell
New-Item -ItemType Directory -Force -Path `
  ".agentflow", `
  ".agentflow/tickets", `
  ".agentflow/events", `
  ".agentflow/evidence", `
  ".agentflow/templates", `
  ".agentflow/skills", `
  ".agentflow/commands", `
  ".agentflow/claims", `
  ".agentflow/lessons", `
  ".agentflow/environment", `
  ".agentflow/profiles", `
  ".agentflow/stacks"
```

---

## 5. Step 4: Populate Framework Files

1. **Policy Files:** Copy initial policy files from `src/init/` to `.agentflow/`:
   - `project.md`
   - `gates.md`
   - `lanes.md`
   - `safety.md`
   - `protected.md`
   - `STATE.md`
   - `workflow-map.md`
   - `CHEATSHEET.md`
2. **Templates:** Copy markdown record templates from `src/templates/` to `.agentflow/templates/`.
3. **Commands:** Copy command prompts from `src/commands/` to `.agentflow/commands/`.
4. **Skills:** Copy skill playbooks from `src/skills/` to `.agentflow/skills/`.

*Note:* If `.agentflow/project.md` already exists, do not overwrite custom project settings. Verify that `schema_version: 1.0.0` is present.

---

## 6. Step 5: Install Agent Adapters with Managed Blocks

When installing an adapter into an agent file, follow the **Managed Block Injection Algorithm**:

### 6.1 The Injection Algorithm

For each target file `F` with adapter content `C`:
1. **Check existence:** Does file `F` exist on disk?
   - **No:** Create `F` with content `C` enclosed in `<!-- agentflow:begin v1.0.0 -->` and `<!-- agentflow:end -->`.
   - **Yes:** Read the existing content of `F`.
2. **Check for existing managed block:**
   - Search for regex: `<!-- agentflow:begin.*?-->[\s\S]*?<!-- agentflow:end -->`
   - **Found:** Replace only the matched substring with the new managed block containing `C`. All text before the begin tag and after the end tag remains unaltered.
   - **Not Found:** Append two newlines followed by the new managed block to the very end of file `F`.

### 6.2 Adapter Mapping Reference

| Target File | Source Adapter File | Installation Behavior |
| :--- | :--- | :--- |
| `AGENTS.md` | `src/adapters/AGENTS.md` | Canonical instruction file. Inject or append managed block. |
| `CLAUDE.md` | `src/adapters/CLAUDE.md` | Claude Code adapter. Inject or append managed block. |
| `.cursor/rules/agentflow.mdc` | `src/adapters/cursor/agentflow.mdc` | Cursor MDC rule file. Create or update file directly. |
| `.windsurfrules` | `src/adapters/windsurf.md` | Windsurf Cascade rules. Inject or append managed block. |
| `.clinerules` | `src/adapters/cline.md` | Cline autonomous rules. Inject or append managed block. |
| `.github/copilot-instructions.md` | `src/adapters/copilot.md` | Copilot Agent Mode. Inject or append managed block. |
| `.aider.conventions.md` | `src/adapters/aider.md` | Aider conventions. Inject or append managed block. |

---

## 7. Step 6: Conflict Detection & Resolution

During adapter injection, inspect existing user rules outside the managed block for conflicting instructions.

### Common Conflicts:
1. **Conflicting Permission Rules:** Existing rules stating *"Always apply all proposed changes immediately"* conflict with Agentflow's Edit Lock.
   - *Resolution:* Agentflow invariants take precedence for governance. Ask the user: *"Your existing rule allows automatic edits without review. Agentflow requires an active ticket and approved manifest before edits. Would you like to keep the strict edit lock?"*
2. **Conflicting Git Commands:** Existing rules stating *"Commit all changes to main after each edit"* conflict with Agentflow's ticket branching policy.
   - *Resolution:* Remind user that Agentflow mandates ticket branches (`ticket/<id>-slug`) and verification records before merging.
3. **Conflicting Tool Paths:** Existing commands mapped to legacy scripts.
   - *Resolution:* Add custom wrappers or configure in `.agentflow/environment/`.

Log any resolved conflicts in `.agentflow/project.md` under `## Project Notes`.

---

## 8. Step 7: Framework Version Stamping

Verify and stamp framework metadata in `.agentflow/project.md`:

```yaml
---
type: project
id: af-prj-baseline
schema_version: 1.0.0
framework_version: 1.0.0
installed_at: 20261115T093000Z
strictness: strict
guidance: expert
---
```

---

## 9. Uninstallation Procedure

If the user chooses to remove Agentflow, follow this clean uninstallation process:

### 9.1 Strip Managed Blocks
For each agent instruction file (`AGENTS.md`, `CLAUDE.md`, `.windsurfrules`, `.clinerules`, `.github/copilot-instructions.md`, `.aider.conventions.md`):
1. Locate `<!-- agentflow:begin.*?-->` through `<!-- agentflow:end -->`.
2. Delete that entire block.
3. If the resulting file is empty, delete the file; otherwise, preserve the remaining user content.
4. Delete `.cursor/rules/agentflow.mdc` if it was created solely for Agentflow.

### 9.2 Handle `.agentflow/` Governance Directory
Provide the user with two uninstallation modes:
- **Mode A: Archival (Recommended):** Move `.agentflow/` to `.agentflow-archive-<timestamp>/` so that project decisions, tickets, evidence, and history are retained for compliance.
- **Mode B: Complete Purge:** Delete the `.agentflow/` directory entirely:
  ```powershell
  Remove-Item -Recurse -Force ".agentflow"
  ```
