---
id: SF-06
command: /af-report
map_phase: any
category: state-to-command
---

# SF-06 — State expects `/af-next` → /af-report

## Given state (STATE.md excerpt)

```
- phase: any
- tickets/ and events/ populated
```

## Expected /af-next output

/af-report — human summary requested; records exist to summarise

## Pass criterion

- /af-next outputs exactly `/af-report` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-report executed at this point is refused by the command guard with a redirect to /af-report.
