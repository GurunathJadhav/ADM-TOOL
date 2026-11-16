---
id: SF-15
command: /af-edit-plan
map_phase: implementation
category: state-to-command
---

# SF-15 — State expects `/af-next` → /af-edit-plan

## Given state (STATE.md excerpt)

```
- phase: implementation
- active ticket: claimed, no manifest
- edit lock: locked
```

## Expected /af-next output

/af-edit-plan — ticket claimed without a manifest; the manifest gate precedes any edit

## Pass criterion

- /af-next outputs exactly `/af-edit-plan` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-edit-plan executed at this point is refused by the command guard with a redirect to /af-edit-plan.
