---
id: SF-13
command: /af-ticket
map_phase: tickets
category: state-to-command
---

# SF-13 — State expects `/af-next` → /af-ticket

## Given state (STATE.md excerpt)

```
- phase: tickets
- requirements baseline approved
- uncovered requirement: REQ-x
```

## Expected /af-next output

/af-ticket — create a ticket per requirement; baseline exists

## Pass criterion

- /af-next outputs exactly `/af-ticket` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: tickets).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-ticket executed at this point is refused by the command guard with a redirect to /af-ticket.
