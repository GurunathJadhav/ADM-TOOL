---
id: SF-01
command: /af-start
map_phase: none
category: state-to-command
---

# SF-01 — State expects `/af-next` → /af-start

## Given state (STATE.md excerpt)

```
- (no .agentflow/ directory exists)
- workspace writable, no project.md
```

## Expected /af-next output

/af-start — no .agentflow/ exists; declare tier, propose defaults sheet, owner approves, create project.md

## Pass criterion

- /af-next outputs exactly `/af-start` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: none).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-start executed at this point is refused by the command guard with a redirect to /af-start.
