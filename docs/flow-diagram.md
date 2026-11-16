# Flow Diagrams

Command-labelled flow diagrams of Agentflow. The single source of truth for every edge is `.agentflow/workflow-map.md`; the owner approves each gate advance.

## Project phases with gates

```mermaid
flowchart TD
    Start["No .agentflow/"] -->|"/af-start (tier declared, defaults sheet approved)"| Discovery[Discovery]
    Discovery -->|"/af-ask"| Discovery
    Discovery -->|"/af-assume → user confirms"| Discovery
    Discovery -->|"/af-confirm-understanding"| G1{"Gate: discovery"}
    G1 -->|"/af-gate — scope baseline approved"| Requirements[Requirements]
    Requirements -->|"/af-requirements"| G2{"Gate: requirements"}
    G2 -->|"/af-gate — baseline approved"| Tickets[Tickets]
    Tickets -->|"/af-ticket per requirement"| Tickets
    Tickets -->|"/af-coverage — every REQ mapped"| G3{"Gate: tickets"}
    G3 -->|"/af-gate — coverage passes"| Planning[Planning]
    Planning -->|"/af-decide, /af-env"| G4{"Gate: planning"}
    G4 -->|"/af-gate — env facts, quality profile, test bootstrap, tier recorded"| Implementation[Implementation]
    Implementation --> Loop["Per-ticket loop (see below)"]
    Loop --> G5{"Gate: implementation"}
    G5 -->|"/af-gate"| Verification["Verification (project-level)"]
    Verification -->|"/af-regression + full quality profile, epic integration, clean-checkout repro"| G6{"Gate: verification"}
    G6 -->|"/af-gate — all pass with V-records"| Review["Review (project-level)"]
    Review -->|"security / architecture / licence reviews, independent"| G7{"Gate: review"}
    G7 -->|"/af-gate — no blocking findings"| Release[Release]
    Release -->|"/af-release-check"| G8{"Gate: release"}
    G8 -->|"/af-gate — owner go-ahead"| Maintenance[Maintenance]
    Maintenance -->|"bug intake: /af-ticket"| Maintenance
    Maintenance -.->|"new epic or /af-change"| Tickets
```

After release, new work returns to `tickets` for those items only; baseline and decisions stay in force.

## Per-ticket implementation loop

```mermaid
flowchart TD
    Ready["Ticket ready"] -->|"/af-edit-plan → manifest approved"| Claim["Claim + baseline"]
    Claim -->|"/af-start-ticket — baseline recorded, edit lock opens"| Step["Edit one step"]
    Step -->|"/af-verify — tests pass with evidence"| Done{"Step verified?"}
    Done -->|"no → fix in step or /af-revert-unverified"| Step
    Done -->|"yes"| More{"More steps?"}
    More -->|"yes"| Step
    More -->|"no"| Diff
    Diff -->|"/af-diff-check — every hunk mapped to a criterion"| DiffOK{"Clean?"}
    DiffOK -->|"unmapped → revert or new ticket"| Step
    DiffOK -->|"yes"| Regr
    Regr -->|"/af-regression — full relevant suite"| RegrOK{"Pass?"}
    RegrOK -->|"failure → /af-ticket (bug), ticket reopened"| Claim
    RegrOK -->|"yes"| Rev
    Rev -->|"/af-review — independent packet, reviewer re-runs checks"| RevOK{"Blocking findings?"}
    RevOK -->|"yes → fix via micro-cycle"| Step
    RevOK -->|"no"| Done2
    Done2 -->|"/af-done — files frozen, edit lock locked"| Next["/af-next"]
```

Off-manifest needs at any point halt edits and route to `/af-expand-scope` (owner approval) before continuing.

## Command routing via /af-next

```mermaid
flowchart LR
    A["Read STATE.md\n(invariants, phase, active ticket,\nedit lock, next_action)"] --> B{"Lookup\nworkflow-map.md"}
    B -->|"state matches a row"| C["Output exact command + reason\n+ what it produces"]
    B -->|"precondition fails"| D["Refuse; name the failed precondition\nand the command that fixes it"]
    B -->|"waiting on human"| E["List needed items in one batch\n(/af-approvals, /af-blockers)"]
    C --> F["STATE.md next_action updated\nfooter shown"]
    E --> F
```

`/af-next` never performs or fakes a human approval — it only lists what needs you. In guided mode it announces the command, why, and what you must do; in expert mode the footer line is enough.
