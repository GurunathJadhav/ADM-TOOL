---
type: requirement
id: REQ-m7n8-eval-runs
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261116T182600Z
actor: agent
role: agent
priority: must
status: in-progress
source_answer: prompt.md S19 (owner-approved spec)
---
# Eval Suite Runs

The eval suite (bad-behaviour scenarios, guidance fixtures, golden project) must be run with real
agents — at least 3 runs per scenario per agent, at least two agents including one weaker model,
plus one Tier 0 chat-only flow — and pass rates reported honestly.
