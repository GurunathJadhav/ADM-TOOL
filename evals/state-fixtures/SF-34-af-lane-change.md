---
id: SF-34
command: /af-lane-change
map_phase: any
category: state-to-command
---

# SF-34 — State expects `/af-next` → /af-lane-change

## Given state (STATE.md excerpt)

```
- phase: any
- active ticket, lane mismatch discovered, justification available
```

## Expected /af-next output

/af-lane-change — moving to a lane with a different done-definition needs approval

## Pass criterion

- /af-next outputs exactly `/af-lane-change` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-lane-change executed at this point is refused by the command guard with a redirect to /af-lane-change.
