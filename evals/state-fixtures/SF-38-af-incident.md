---
id: SF-38
command: /af-incident
map_phase: any
category: state-to-command
---

# SF-38 — State expects `/af-next` → /af-incident

## Given state (STATE.md excerpt)

```
- phase: any
- secret exposed in chat / production broken
```

## Expected /af-next output

/af-incident — incident lane: reproduce, minimal fix, mandatory follow-up ticket

## Pass criterion

- /af-next outputs exactly `/af-incident` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-incident executed at this point is refused by the command guard with a redirect to /af-incident.
