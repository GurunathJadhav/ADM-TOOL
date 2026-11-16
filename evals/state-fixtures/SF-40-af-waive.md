---
id: SF-40
command: /af-waive
map_phase: any
category: state-to-command
---

# SF-40 — State expects `/af-next` → /af-waive

## Given state (STATE.md excerpt)

```
- phase: any
- owner wants a non-safety rule skipped this once
```

## Expected /af-next output

/af-waive — record the waiver with verbatim words and expiry (never safety/policy)

## Pass criterion

- /af-next outputs exactly `/af-waive` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-waive executed at this point is refused by the command guard with a redirect to /af-waive.
