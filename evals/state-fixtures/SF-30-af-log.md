---
id: SF-30
command: /af-log
map_phase: any
category: state-to-command
---

# SF-30 — State expects `/af-next` → /af-log

## Given state (STATE.md excerpt)

```
- phase: any
- state change occurred without its event yet
```

## Expected /af-next output

/af-log — write the event for the state change (write-ahead rule applies)

## Pass criterion

- /af-next outputs exactly `/af-log` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-log executed at this point is refused by the command guard with a redirect to /af-log.
