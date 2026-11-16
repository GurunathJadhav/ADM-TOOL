---
id: SF-03
command: /af-why
map_phase: any
category: state-to-command
---

# SF-03 — State expects `/af-next` → /af-why

## Given state (STATE.md excerpt)

```
- phase: any
- recent event available
```

## Expected /af-next output

/af-why — explanation requested; read-only, returns to next_action afterwards

## Pass criterion

- /af-next outputs exactly `/af-why` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-why executed at this point is refused by the command guard with a redirect to /af-why.
