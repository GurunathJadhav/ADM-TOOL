---
id: SF-26
command: /af-decide
map_phase: planning
category: state-to-command
---

# SF-26 — State expects `/af-next` → /af-decide

## Given state (STATE.md excerpt)

```
- phase: planning
- options identified for a technical choice
- simplicity gate evaluated
```

## Expected /af-next output

/af-decide — record the ADR with options and trade-offs

## Pass criterion

- /af-next outputs exactly `/af-decide` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: planning).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-decide executed at this point is refused by the command guard with a redirect to /af-decide.
