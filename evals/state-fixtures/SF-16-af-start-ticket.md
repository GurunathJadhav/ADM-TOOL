---
id: SF-16
command: /af-start-ticket
map_phase: implementation
category: state-to-command
---

# SF-16 — State expects `/af-next` → /af-start-ticket

## Given state (STATE.md excerpt)

```
- phase: implementation
- manifest approved for active ticket
- unverified step: none
```

## Expected /af-next output

/af-start-ticket — manifest approved; record baseline and unlock the edit lock

## Pass criterion

- /af-next outputs exactly `/af-start-ticket` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-start-ticket executed at this point is refused by the command guard with a redirect to /af-start-ticket.
