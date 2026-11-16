---
type: question
id: Q-n7p8-licence
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261116T182622Z
actor: agent
role: agent
category: compliance/legal/privacy
blocking: true
answer_needed_from: owner
---
# Which licence should the framework carry?

## Question
Under which licence should Agentflow be published?

## Why it matters
S18 requires a stated licence before the framework is distributed; attribution rules and reuse
terms depend on it. Publishing without one defaults to "all rights reserved", which blocks the
template/skill-pack reuse the framework is designed for.

## Recommended default
MIT — permissive, allows the template-pack distribution model, and is compatible with bundling
Agentflow into proprietary projects. Alternatives: Apache-2.0 (adds explicit patent grant) if
patent protection matters to you.

## Verbatim answer
"MIT (Recommended)" — owner, 2026-11-17, via structured approval (recorded verbatim in
approval `A-k1m3-licence-fixture.md`: *"Permissive; allows bundling Agentflow into any project,
matches the template-pack distribution model. Recommended default in Q-n7p8."*)
(answer event: `events/20261117T154632Z-none-question-answered-E-p7q8-q-n7p8-licence-answer.md`)

## Result
Answered (blocking). Decision record: D-i9j0-licence-mit.
