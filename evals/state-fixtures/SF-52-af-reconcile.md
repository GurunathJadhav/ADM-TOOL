---
id: SF-52
command: /af-reconcile
map_phase: any
category: state-to-command
---

# SF-52 — State expects `/af-next` → /af-reconcile

## Given state (STATE.md excerpt)

```
- phase: any
- duplicate records / log-vs-disk divergence observed
```

## Expected /af-next output

/af-reconcile — correction events for duplicates; rebuild derived views

## Pass criterion

- /af-next outputs exactly `/af-reconcile` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-reconcile executed at this point is refused by the command guard with a redirect to /af-reconcile.
