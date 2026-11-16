# Agentflow Master Format Specification
<!-- Document: src/format-spec.md — Authoritative schema and formatting standard for Agentflow records and state. -->
<!-- Version: 1.0.0 | Status: Active | Compliance: Mandatory for all Agentflow tools, skills, and agents. -->

---

## 1. Overview & Architecture

Agentflow is a file-based, deterministic operating system for autonomous coding agents.
All state, specifications, decisions, and history are stored as standard Markdown files inside `.agentflow/`.

### 1.1 Architectural Principles
- **One File Per Record:** Every ticket, question, decision, verification, and event is an independent file. There are no monolithic mutable JSON/YAML state databases.
- **Append-Only History:** Records are never edited in place to update status. State changes are captured via immutable event records in `events/`.
- **Derived Views are Disposable:** Summary documents (`STATE.md`, `CHEATSHEET.md`, index registers) are purely derived projections. If git conflicts occur, delete derived files and rebuild with `/af-rebuild`.
- **Universal Portability:** Works in Tier 0 (chat copy-paste), Tier 1 (filesystem commands), and Tier 2 (hooks and CI).

---

## 2. Front-Matter Specification

Every record file must start with a YAML front-matter block enclosed by triple-dash `---` delimiters.

### 2.1 Syntax Rules
- Front-matter begins on line 1, column 1 with `---`.
- Closes with `---` on its own line preceding the Markdown body.
- Formatting must use standard `key: value` pairs with 2-space indentation for nested maps and lists.
- Values containing special characters (`:`, `#`, `[`, `{`, `@`) must be quoted in double quotes `"..."`.
- All keys, status identifiers, and enum tokens must be lowercase English (`en`), regardless of the human language configured in `project.md`.

### 2.2 Common Mandatory Fields (All Records)
Every record created within the framework MUST include these 7 fields:

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `type` | string | The canonical record type identifier | `ticket`, `decision`, `event` |
| `id` | string | Unique identifier formatted per §3 | `T-x4kq-login-flow` |
| `project_id` | string | Unique project identifier from `project.md` | `af-prj-98a2` |
| `schema_version` | string | Semantic schema version | `1.0.0` |
| `created` | string | Compact UTC timestamp per §4 | `20261115T093000Z` |
| `actor` | string | Identifier of the agent or human creator | `agentflow-worker`, `alice` |
| `role` | string | Role under which creator acted | `agent`, `owner`, `approver`, `reviewer` |

### 2.3 Record Types and Type-Specific Fields

| Record Type | Target Directory | Key Required Fields | Allowed Enums / Values |
| :--- | :--- | :--- | :--- |
| `ticket` | `tickets/` | `lane`, `priority`, `size`, `title`, `req_links` | `lane`: `trivial`, `standard`, `incident`<br>`priority`: `must`, `should`, `could`, `wont`<br>`size`: `S`, `M`, `L` |
| `question` | `questions/` | `category`, `blocking`, `answer_needed_from` | `category`: `scope`, `architecture`, `ux`, `deps`<br>`blocking`: `true`, `false`<br>`answer_needed_from`: `owner`, `approver` |
| `decision` | `decisions/` | `title`, `decision_type`, `status`, `supersedes` | `decision_type`: `one-way`, `two-way`<br>`status`: `proposed`, `approved`, `superseded`<br>`supersedes`: `<D-id>` or `none` |
| `manifest` | `manifests/` | `ticket_id`, `allowed_to_modify`, `allowed_to_create`, `explicitly_not_touched`, `edit_budget` | `edit_budget.max_files`: integer<br>`edit_budget.max_lines`: integer |
| `baseline` | `baselines/` | `ticket_id`, `repo_revision`, `tree_status`, `manifest_files` | `tree_status`: `clean`, `dirty`<br>`manifest_files`: list of paths + sha256 |
| `verification` | `verifications/` | `ticket_id`, `method`, `command`, `result`, `evidence_ref` | `method`: `test`, `lint`, `typecheck`, `manual`, `audit`<br>`result`: `pass`, `fail`, `waived` |
| `approval` | `approvals/` | `target_record`, `role`, `verbatim_quote`, `countersign` | `countersign`: boolean (`true` for high-risk rules) |
| `claim` | `claims/` | `statement`, `label`, `basis`, `evidence_ref` | `label`: `verified`, `inferred`, `unknown` |
| `blocker` | `blockers/` | `ticket_id`, `blocker_type`, `owner`, `needed_by` | `blocker_type`: `human`, `technical` |
| `review` | `reviews/` | `ticket_id`, `reviewer_type`, `verdict`, `findings_count` | `reviewer_type`: `agent`, `human`, `fresh-session`<br>`verdict`: `approved`, `changes-requested` |
| `requirement`| `requirements/` | `req_id`, `priority`, `status`, `source_answer` | `priority`: `must`, `should`, `may`<br>`status`: `active`, `deferred`, `deprecated` |
| `glossary` | `glossary/` | `term`, `definition`, `confirmed_by` | `confirmed_by`: user name or `pending` |
| `risk` | `risks/` | `title`, `likelihood`, `impact`, `mitigation` | `likelihood`: `low`, `medium`, `high`<br>`impact`: `low`, `medium`, `high` |
| `lesson` | `lessons/` | `title`, `category`, `ticket_ref` | `category`: `mistake`, `pattern`, `tooling`, `process` |
| `environment`| `environment/` | `fact_name`, `value`, `label`, `evidence_ref` | `label`: `verified`, `inferred` |
| `waiver` | `waivers/` | `rule`, `reason`, `role`, `expires`, `verbatim_quote` | `expires`: timestamp or `ticket-end` |
| `evidence` | `evidence/<ticket>/`| `ticket_id`, `source_command`, `truncated` | `truncated`: `true`, `false` |
| `event` | `events/` | `event_type`, `ticket_id`, `summary`, `evidence_refs` | `event_type`: see §5.2 |

---

## 3. Identifier Generation Rules

Every entity in Agentflow has a globally unique, collision-resistant identifier.

### 3.1 ID Syntax
```
<Prefix>-<4-char-base32>-<slug>
```

- **Prefix:** Uppercase alphabetic abbreviation defining entity class.
- **Random Token:** Exactly 4 lowercase base32 characters generated from random bytes.
- **Slug:** 1 to 4 lowercase English words joined by hyphens, describing the entity (max 30 characters).

### 3.2 Standard Prefix Table
| Entity | Prefix | Example ID |
| :--- | :--- | :--- |
| Ticket | `T` | `T-x4kq-auth-login` |
| Question | `Q` | `Q-9m2p-database-engine` |
| Decision (ADR) | `D` | `D-k7we-use-postgresql` |
| Verification | `V` | `V-j8az-auth-unit-tests` |
| Approval | `A` | `A-3p1q-manifest-approval` |
| Claim | `CL` | `CL-4mbv-node-version-check` |
| Blocker | `B` | `B-81ka-missing-api-credentials` |
| Review | `R` | `R-y5nr-auth-pr-review` |
| Requirement | `REQ` | `REQ-2tvx-user-registration` |
| Risk | `RISK`| `RISK-6wqe-rate-limiting` |
| Lesson | `L` | `L-1m4z-mock-fs-pitfall` |
| Waiver | `W` | `W-7n3b-skip-e2e-ci` |
| Evidence | `E` | `E-9x8a-pytest-run-output` |

### 3.3 Base32 Character Set
To prevent optical confusion, the 4 random characters use the Crockford Base32 alphabet (lowercase):
`0 1 2 3 4 5 6 7 8 9 a b c d e f g h j k m n p q r s t v w x y z`
*(Omitted characters: `i`, `l`, `o`, `u`)*.

---

## 4. Timestamp Format

All temporal markers must follow compact UTC representation.

### 4.1 Specification
```
YYYYMMDDTHHMMSSZ
```
- Exactly 16 characters.
- Standard ISO 8601 UTC representation with all separators (`-`, `:`) removed.
- Always terminated with `Z`.
- Example: `20261115T093000Z` represents 15-Nov-2026 at 09:30:00 UTC.

### 4.2 Prohibited Patterns
- **No Colons:** Colons (`:`) are strictly forbidden because Windows filesystems prohibit colons in filenames.
- **No Local Timezones:** Non-UTC offsets (`+05:30`, `-04:00`) are forbidden.
- **No Hallucinated Clocks:** When no system clock is available, the agent must set `created: unknown`. The value is resolved later by git commit timestamps or human backfill.

---

## 5. Event Filenames and Event Log

The `events/` directory is the single append-only ledger for project state transitions.

### 5.1 Event Filename Pattern
```
events/<compact-utc>-<ticket-or-none>-<event-type>-<id>.md
```

- **`<compact-utc>`:** 16-character timestamp.
- **`<ticket-or-none>`:** Active ticket ID (e.g. `T-x4kq-auth`) or literal `none` if project-wide.
- **`<event-type>`:** Lowercase kebab-case event category.
- **`<id>`:** The ID of the primary entity created or affected.

### 5.2 Standard Event Types
- `record-created`: New entity record written.
- `status-change`: State transition (e.g., ticket moved to `in-progress`).
- `approval-granted`: Human approval recorded.
- `manifest-approved`: Edit manifest signed off.
- `verification-pass`: Verification suite executed successfully.
- `verification-fail`: Verification failed with errors.
- `diff-checked`: Diff verified against approved manifest.
- `review-completed`: Independent review submitted.
- `phase-advance`: Lifecycle phase gate passed.
- `blocker-raised`: New technical or human blocker logged.
- `blocker-cleared`: Blocker resolved.
- `waiver-granted`: Temporary exception signed by owner.
- `rule-change`: Framework or policy modification approved.
- `pause`: Session paused with handoff.
- `resume`: Session resumed.
- `correction`: Non-destructive historical correction event.

### 5.3 Filename Examples
- `events/20261115T093000Z-T-x4kq-auth-status-change-T-x4kq-auth.md`
- `events/20261115T093500Z-T-x4kq-auth-manifest-approved-A-3p1q-manifest.md`
- `events/20261115T100000Z-none-phase-advance-discovery-to-requirements.md`

---

## 6. Status Derivation Rules

To prevent git merge conflicts and ensure strict auditability, **entity status is NEVER stored in record files**.

### 6.1 Derivation Algorithm
1. To obtain the status of entity `<ID>`:
2. Query directory `events/` filtering by filenames containing `<ID>`.
3. Sort matching filenames in lexicographical ascending order (which corresponds to chronological order due to `<compact-utc>`).
4. Read the latest event record.
5. Extract the state transition payload from the event front matter.
6. If no events exist, the default status is `created`.

### 6.2 Benefits
- Branch merging never causes conflicts on ticket or question definitions.
- Status history is immutable, tamper-evident, and fully traceable.
- Reverting status is accomplished by appending a new event, never rewriting history.

---

## 7. Filesystem and File Naming Rules

To ensure universal compatibility across Windows, macOS, Linux, and containerized sandboxes, all Agentflow paths must conform to these rules:

1. **Character Encoding:** UTF-8 strictly without Byte Order Mark (BOM).
2. **Line Delimiters:** Unix line endings (`LF` / `\n`) exclusively. Never write Windows `CRLF`.
3. **Forbidden Characters:** Filenames must NOT contain:
   `:` (colon), `\` (backslash), `/` (slash in basename), `*` (asterisk), `?` (question mark), `"` (quote), `<` (less than), `>` (greater than), `|` (pipe), `^` (caret).
4. **Reserved Device Names:** Never use Windows reserved device basenames (case-insensitive):
   `CON`, `PRN`, `AUX`, `NUL`, `COM1` through `COM9`, `LPT1` through `LPT9`.
5. **Case-Sensitivity Safety:** No two files or directories may exist whose paths differ only in character case (e.g., `README.md` and `readme.md`).
6. **Path Length Ceiling:** Total relative path length within `.agentflow/` must not exceed 200 characters to stay well under Windows standard `MAX_PATH` (260 character) limits.

---

## 8. Derived View Rebuild Rules

Derived views are read-only summary projections generated from canonical records and events.

### 8.1 List of Derived Views
- `.agentflow/STATE.md` (runtime state and ticket board)
- `.agentflow/CHEATSHEET.md` (command lookup)
- `.agentflow/requirements.md` (requirements index)
- `.agentflow/glossary.md` (glossary index)
- `.agentflow/risks.md` (risk register)
- `.agentflow/lessons.md` (lessons learned index)
- `.agentflow/traceability.md` (requirement-to-test mapping)
- `.agentflow/codemap.md` (codebase map)
- `.agentflow/APPROVALS-NEEDED.md` (pending approvals queue)

### 8.2 Incremental Rebuild Algorithm
1. Read `.agentflow/STATE.md` and note `built_from` (last processed event ID).
2. Scan `events/` for event files timestamped after `built_from`.
3. If no new events exist, state is current; terminate.
4. Process new events sequentially, updating:
   - `phase`, `active_ticket`, `active_manifest`, `edit_lock`
   - Ticket board lists and counters
   - Open blockers and unknowns
   - Recent events list (last 5)
5. Over the 1,000 token cap, trim according to strict order:
   - Trim older events
   - Trim completed ticket details (collapse to counts)
   - Trim older lessons
   - **NEVER DROP:** Invariants block, Status section, active ticket/manifest, open blockers, or Next Action.
6. Write atomic replacement `STATE.md` stamped with the newest event ID in `built_from`.

### 8.3 Conflict Handling
Derived files must never be manually merged during git branch resolution. If a merge conflict occurs:
```bash
# Delete conflicted derived files
rm .agentflow/STATE.md .agentflow/*.md
# Re-run rebuild command
af-rebuild
```

---

## 9. Evidence Format Specification

Every claim of verification, bug reproduction, or test success requires structured evidence.

### 9.1 File Location and Naming
```
.agentflow/evidence/<ticket-id>/<slug>.md
```
Example: `.agentflow/evidence/T-x4kq-auth/unit-test-output.md`

### 9.2 Content Structure
```markdown
---
type: evidence
id: E-9x8a-pytest-auth
ticket_id: T-x4kq-auth
project_id: af-prj-98a2
schema_version: 1.0.0
created: 20261115T094000Z
actor: agentflow-worker
role: agent
source_command: pytest tests/test_auth.py -v
exit_code: 0
truncated: false
---

# Evidence: Unit Test Output for Auth Flow

## Execution Context
- Working Directory: `c:\Users\User\Desktop\ADM-Tool`
- Executed At: 20261115T094000Z
- Exit Code: 0

## Raw Output
```text
============================= test session starts =============================
platform win32 -- Python 3.11.4, pytest-7.4.0
rootdir: c:\Users\User\Desktop\ADM-Tool
collected 8 items

tests/test_auth.py::test_login_success PASSED                           [ 12%]
tests/test_auth.py::test_login_invalid_password PASSED                  [ 25%]
tests/test_auth.py::test_session_token_generation PASSED                [ 37%]
tests/test_auth.py::test_token_expiry PASSED                            [ 50%]
tests/test_auth.py::test_logout PASSED                                  [ 62%]
tests/test_auth.py::test_password_hash_bcrypt PASSED                    [ 75%]
tests/test_auth.py::test_rate_limiting PASSED                           [ 87%]
tests/test_auth.py::test_csrf_validation PASSED                         [100%]

============================== 8 passed in 1.42s ==============================
```
```

### 9.3 Trimming Rules
- Evidence raw output must be capped at approximately **200 lines**.
- If output exceeds 200 lines:
  - Keep the first 100 lines (setup, environment, start of test run).
  - Insert `[... truncated N lines by Agentflow evidence policy ...]`
  - Keep the last 100 lines (summary, failures, exit status).
  - Set `truncated: true` in front matter.

---

## 10. Tier 0 Paste-Back Protocol

When an agent operates in an environment without direct filesystem write access (e.g., web chat, restricted sandbox), it executes the Tier 0 Paste-Back Protocol.

### 10.1 Output Structure
The agent outputs each newly created or modified file inside an explicit, unambiguous file container block:

```text
FILE: .agentflow/tickets/T-x4kq-auth.md
---
type: ticket
id: T-x4kq-auth
project_id: af-prj-98a2
schema_version: 1.0.0
created: 20261115T093000Z
actor: agentflow-worker
role: agent
lane: standard
priority: must
size: S
title: Implement session token login
req_links: [REQ-2tvx-user-auth]
---

# User Story: User Login

**As a** registered user
**I want to** authenticate with email and password
**So that** I can access protected endpoints securely.

## Acceptance Criteria
- Given valid credentials, When POST /login, Then return 200 and session JWT.
- Given invalid password, When POST /login, Then return 401 Unauthorized.
```

### 10.2 Paste-Back Rules
1. **Delta Only:** Emit ONLY files that are newly created or modified. Never re-emit unchanged files.
2. **State Output:** Always emit the updated `.agentflow/STATE.md` as the final file block.
3. **Session Re-grounding Request:** Conclude the turn with instructions for the user:
   > *"I have generated the updated records above. Please save them to your workspace. At the start of your next session, paste `.agentflow/STATE.md` to resume seamlessly."*
4. **Footer:** Always include the standard Agentflow reply footer at the very end of the response.
