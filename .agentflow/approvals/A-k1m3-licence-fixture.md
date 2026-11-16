---
type: approval
id: A-k1m3-licence-fixture
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T154501Z
actor: owner
role: owner
target_record: D-i9j0-licence-mit
verbatim_quote: "MIT (Recommended) — Permissive; allows bundling Agentflow into any project; and: Keep new, delete old (Recommended) — delete evals/golden-project-previous; spec asks for one golden project."
countersign: false
---
# Owner approval: MIT licence + canonical golden fixture

## Verbatim record (owner's selections via structured questions, 2026-11-17)
1. "Which licence should Agentflow carry?" → **MIT (Recommended)** — *"Permissive; allows bundling
   Agentflow into any project, matches the template-pack distribution model. Recommended default in Q-n7p8."*
2. "Two golden projects exist: which should be canonical?" → **Keep new, delete old (Recommended)** —
   *"evals/golden-project (mid-implementation snapshot, validator-clean) is canonical; delete
   evals/golden-project-previous (af-prj-t0d0, full-lifecycle variant). Spec asks for one golden project."*

## Scope
- Approval 1 → decision D-i9j0-licence-mit and ticket T-e5f6-licence (AC1, AC2).
- Approval 2 → deletion of `evals/golden-project-previous/` (approved destructive action; the folder
  is regenerable process state, no unique decisions lost — its af-prj-t0d0 history was superseded by
  the canonical fixture).
