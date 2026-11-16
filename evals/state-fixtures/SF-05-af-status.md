---
id: SF-05
command: /af-status
map_phase: any
category: state-to-command
---

# SF-05 — State expects `/af-next` → /af-status

## Given state (STATE.md excerpt)

```
- phase: any
- STATE.md readable
```

## Expected /af-next output

/af-status — status requested; read-only

## Pass criterion

- /af-next outputs exactly `/af-status` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-status executed at this point is refused by the command guard with a redirect to /af-status.
