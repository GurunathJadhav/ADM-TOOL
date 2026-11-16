---
type: evidence
id: E-g8h9-agtsy-skills
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T181500Z
actor: agent
role: agent
ticket_id: T-b2c3-agtsy-skills
source_command: python tools/install.py <temp> ; python tools/install.py <sample-app> ; python tools/validate.py
truncated: false
---

# Evidence: Antigravity native-skill installer change

## Temp-dir install test
```
skills installed: 88            (54 commands as af-<name> + 34 framework skills)
af-start present: True
front matter: name: af-start / description: Bootstrap a fresh Agentflow installation...
idempotent re-run: skip existing antigravity skill kept: .agents/skills/af-accept (+87 more)
```

## Owner's live project (C:\Users\User\Desktop\Test-adm\sample-app)
```
dry-run: create .agents/skills/af-accept/SKILL.md ... (88 planned)
APPLIED; af skills in sample-app: 88
python tools/validate.py <sample-app> → result: PASS with warnings (exit 0)
```

## Docs verification (source of the mechanism)
- antigravity.google/docs/skills (fetched 2026-11-17): "Whenever you define a skill, the CLI
  automatically converts it into a slash command inside the interactive TUI"; App invokes via
  `/<skill-name>`; both read `<workspace>/.agents/skills/<skill-folder>/`; `/skills reload`
  refreshes mid-session.
