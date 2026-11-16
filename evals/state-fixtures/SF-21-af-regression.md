---
id: SF-21
command: /af-regression
map_phase: implementation
category: state-to-command
---

# SF-21 — State expects `/af-next` → /af-regression

## Given state (STATE.md excerpt)

```
- phase: implementation
- diff check passed
- regression since last run: pending
```

## Expected /af-next output

/af-regression — diff clean; run the wider regression set before review

## Pass criterion

- /af-next outputs exactly `/af-regression` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-regression executed at this point is refused by the command guard with a redirect to /af-regression.
