---
id: SF-51
command: /af-undo-plan
map_phase: planning
category: state-to-command
---

# SF-51 — State expects `/af-next` → /af-undo-plan

## Given state (STATE.md excerpt)

```
- phase: planning
- approved plan must be rolled back
- no permanent code changes
```

## Expected /af-next output

/af-undo-plan — supersede the plan via correction event; never delete records

## Pass criterion

- /af-next outputs exactly `/af-undo-plan` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: planning).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-undo-plan executed at this point is refused by the command guard with a redirect to /af-undo-plan.
