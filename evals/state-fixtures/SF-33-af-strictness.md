---
id: SF-33
command: /af-strictness
map_phase: any
category: state-to-command
---

# SF-33 — State expects `/af-next` → /af-strictness

## Given state (STATE.md excerpt)

```
- phase: any
- owner asked to change strictness level
```

## Expected /af-next output

/af-strictness — strictness changes are rule changes with countersign

## Pass criterion

- /af-next outputs exactly `/af-strictness` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-strictness executed at this point is refused by the command guard with a redirect to /af-strictness.
