---
id: SF-10
command: /af-confirm-understanding
map_phase: discovery
category: state-to-command
---

# SF-10 — State expects `/af-next` → /af-confirm-understanding

## Given state (STATE.md excerpt)

```
- phase: discovery
- open blocking questions: 0
- unconfirmed assumptions: 0
```

## Expected /af-next output

/af-confirm-understanding — all blocking closed; summarise understanding for explicit confirmation

## Pass criterion

- /af-next outputs exactly `/af-confirm-understanding` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: discovery).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-confirm-understanding executed at this point is refused by the command guard with a redirect to /af-confirm-understanding.
