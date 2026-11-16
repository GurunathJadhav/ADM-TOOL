---
id: SF-08
command: /af-ask
map_phase: discovery
category: state-to-command
---

# SF-08 — State expects `/af-next` → /af-ask

## Given state (STATE.md excerpt)

```
- phase: discovery
- open blocking questions: 2
```

## Expected /af-next output

/af-ask — blocking questions open in discovery; ask batched, blocking first

## Pass criterion

- /af-next outputs exactly `/af-ask` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: discovery).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-ask executed at this point is refused by the command guard with a redirect to /af-ask.
