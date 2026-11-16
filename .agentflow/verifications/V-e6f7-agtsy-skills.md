---
type: verification
id: V-e6f7-agtsy-skills
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T181501Z
actor: agent
role: agent
ticket_id: T-b2c3-agtsy-skills
criterion_id: AC1-AC4
method: command-output
result: pass
evidence_ref: evidence/T-b2c3-agtsy-skills/agtsy-skills-verification.md
---
# Verification: Antigravity native skills

- AC1: installer copies each `af-<name>.md` command to `.agents/skills/af-<name>/SKILL.md` (88 total incl. 34 skills) — temp test PASS.
- AC2: re-run skips all existing (never overwrites) — verified.
- AC3: adapter guide + antigravity.md adapter updated with the verified mechanism and `/skills reload` note.
- AC4: fresh temp install front matter valid; owner's sample-app updated (88 skills) and validates PASS (exit 0).
