---
id: SF-25
command: /af-retro
map_phase: implementation
category: state-to-command
---

# SF-25 — State expects `/af-next` → /af-retro

## Given state (STATE.md excerpt)

```
- phase: implementation
- epic accepted (A-record exists)
```

## Expected /af-next output

/af-retro — epic accepted; capture lessons while fresh

## Pass criterion

- /af-next outputs exactly `/af-retro` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-retro executed at this point is refused by the command guard with a redirect to /af-retro.
