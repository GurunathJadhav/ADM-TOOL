# Changelog

All notable changes to the Agentflow framework. Format based on Keep a Changelog; versioning is
semantic (S18).

## [1.0.0] — 2026-11-16

### Added
- **Protocol (L1):** record format spec (`src/format-spec.md`), 19 record templates, init pack
  (`project.md`, `gates.md`, `lanes.md`, `safety.md`, `protected.md`, `workflow-map.md`,
  `STATE.md`, `CHEATSHEET.md`).
- **Commands (54):** full `/af-*` prompt-file set including guidance engine core (`/af-start`,
  `/af-next`, `/af-ask`, `/af-ticket`, `/af-verify`, `/af-done`, `/af-status`, `/af-help`), recovery
  (`/af-doctor`, `/af-reconcile`, `/af-rebuild`), and governance (`/af-rule-change`, `/af-waive`).
- **Skills (34):** all S12 skills including the `using-agentflow` router; `tdd-implementation`,
  `debugging`, and `scope-guard` reference the micro-cycle, reproduce-first rule, and manifest.
- **Adapters:** `AGENTS.md`, `CLAUDE.md`, generic fallback (Tier 0 paste-back protocol).
- **Profiles (7):** web-app, api, mobile, cli-tool, data-pipeline, library, generic — question
  banks, default NFRs, test strategies, risks, ticket checklists.
- **Docs:** 5-minute quickstart, concepts, adapter guide, custom-skills guide,
  limits-of-enforcement, flow diagrams.
- **Tooling (optional, zero dependencies):** `tools/install.py` (non-destructive installer,
  dry-run, managed blocks) and `tools/validate.py` (Tier-1 validator: front matter, project_id,
  secrets, done-without-evidence, manifest overlaps, STATE freshness, coverage, dangling refs;
  `--rebuild` rebuilds derived indexes deterministically).
- **Evals:** golden example project fixture and bad-behaviour scenarios (S19).

### Notes
- Framework tooling makes no network calls and no telemetry.
- Validator language chosen by owner: **Python**.
- Licence chosen by owner on 2026-11-17: **MIT** (`LICENSE`, decision D-i9j0-licence-mit).
