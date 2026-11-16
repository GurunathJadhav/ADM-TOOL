---
project_id: af-prj-0007-agentflow-self
name: agentflow-framework
description: The Agentflow framework's own build and governance (self-hosted dogfood project)
record_language: en
schema_version: 1.0.0
framework_version: 1.0.0
owner: <owner-name>
approvers:
  - <owner-name>
reviewers:
  - <owner-name>
observers: []
user_level: technical
guidance: expert
discovery_depth: per-project
strictness: strict
---

# Project Configuration
<!-- Template: copied to .agentflow/project.md at bootstrap. Fill in placeholder values during /af-start. -->

## Roles

Solo mode: the owner holds all roles (owner, approver, reviewer, observer).
Multi-user: list each person under the appropriate field above.

## Complexity Budget

| Constraint       | Limit                        |
|------------------|------------------------------|
| max_dependencies | <set-during-discovery>       |
| max_layers       | <set-during-discovery>       |

## Standing Approvals

Standing approvals allow the agent to skip per-item approval for low-risk, well-defined actions.
Each use is logged with a reference to the standing approval. Protected paths, deletions, production,
runtime dependencies, scope expansion, and rule changes are **never** covered by a standing approval.

| ID  | Scope                                                                 | Conditions                                  |
|-----|-----------------------------------------------------------------------|---------------------------------------------|
| SA1 | S-size manifests touching only `src/` and its test files              | Files within `src/` and corresponding tests |
| SA2 | Dev dependencies (permissive licence, ≤2 packages per addition)       | Permissive licence (MIT, Apache-2.0, BSD), max 2 packages |
| SA3 | Trivial-lane tasks (≤5 lines, ≤1 file)                               | Meets trivial-lane criteria in `lanes.md`   |

## Quality Profile

Quality gates checked at the indicated frequency. Each must pass for the relevant gate to clear.
A gate that cannot run is marked **unverified** and requires owner sign-off.

| Gate                  | Command                      | Pass Condition                | Frequency          |
|-----------------------|------------------------------|-------------------------------|---------------------|
| Formatter             | `<formatter-cmd>`            | No formatting diff            | Per step            |
| Linter                | `<linter-cmd>`               | Zero errors                   | Per step            |
| Type check            | `<typecheck-cmd>`            | Zero errors                   | Per step            |
| Static analysis       | `<static-analysis-cmd>`      | Zero high/critical findings   | Per ticket          |
| Dependency audit      | `<dep-audit-cmd>`            | Zero known vulnerabilities    | Per ticket          |
| Secret scan           | `<secret-scan-cmd>`          | Zero findings                 | Per ticket          |
| Licence check         | `<licence-check-cmd>`        | All permissive                | Per ticket          |
| Coverage target       | `<coverage-cmd>`             | ≥ 80%                         | Per ticket          |
| Accessibility check   | `<a11y-cmd>`                 | Zero critical findings        | Per ticket (UI)     |
| Performance budget    | `<perf-cmd>`                 | Within stated budgets         | Per release         |
| Build reproducibility | `<build-cmd>`                | Deterministic output          | Per release         |

## Effort Budgets

Size limits for tickets. Exceeding a budget triggers stop-and-ask.

| Size | Max Files | Max Lines | Approx Steps | Approx Retries | Notes                              |
|------|-----------|-----------|---------------|----------------|------------------------------------|
| S    | 3         | 100       | ~5            | 2              | —                                  |
| M    | 7         | 300       | ~12           | 3              | —                                  |
| L    | —         | —         | —             | —              | Must be split into S or M tickets  |

## Profile

profile: <web-app | api | mobile | cli | data-pipeline | library | generic>

## Stack

stack: <to-be-determined-during-discovery>
conventions: <to-be-determined-during-discovery>
