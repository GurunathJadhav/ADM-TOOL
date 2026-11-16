---
project_id: af-prj-9001
name: todo-notes
description: Tiny CLI task tracker (add/list/complete) persisted in a single JSON file
record_language: en
schema_version: 1.0.0
framework_version: 1.0.0
owner: owner
approvers:
  - owner
reviewers:
  - owner
observers: []
user_level: technical
guidance: expert
discovery_depth: standard
strictness: balanced
tier: 1
---

# Project Configuration

Golden example project (S19). Solo mode: the owner holds all roles
(owner, approver, reviewer, observer).

## Complexity Budget

| Constraint       | Limit |
|------------------|-------|
| max_dependencies | 0 runtime (stdlib only); dev deps ≤ 2 |
| max_layers       | 2 (cli, store/format) |

## Standing Approvals

| ID  | Scope | Conditions |
|-----|-------|------------|
| SA1 | S-size manifests touching only `src/` and its test files | Files within `src/` and corresponding tests |
| SA2 | Dev dependencies (permissive licence, ≤2 packages per addition) | Permissive licence (MIT, Apache-2.0, BSD) |
| SA3 | Trivial-lane tasks (≤5 lines, ≤1 file) | Meets trivial-lane criteria in `lanes.md` |

## Quality Profile

| Gate            | Command                              | Pass Condition   | Frequency  |
|-----------------|--------------------------------------|------------------|------------|
| Test            | `python -m pytest tests/ -q`         | Zero failed      | Per step   |
| Linter          | `python -m ruff check src tests`     | Zero errors      | Per ticket |
| Type check      | not configured (dynamic language)    | unverified       | —          |
| Dependency audit| `python -m pip list` + vetting skill | No new runtime deps | Per ticket |
| Coverage target | not configured for v1                | unverified       | —          |

Gates marked `unverified` need owner sign-off at the relevant gate (S16).

## Effort Budgets

| Size | Max Files | Max Lines | Approx Steps | Approx Retries |
|------|-----------|-----------|--------------|----------------|
| S    | 3         | 100       | ~5           | 2              |
| M    | 7         | 300       | ~12          | 3              |
| L    | —         | —         | —            | Must be split  |

## Profile and Stack

profile: cli-tool
stack: Python 3.12, stdlib only (json, argparse), pytest as dev test runner
conventions: ruff line-length 100; tests in `tests/`, mirrored from `src/todo_notes/`
