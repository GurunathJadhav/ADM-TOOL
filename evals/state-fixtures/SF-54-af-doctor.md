---
id: SF-54
command: /af-doctor
map_phase: any
category: state-to-command
---

# SF-54 — State expects `/af-next` → /af-doctor

## Given state (STATE.md excerpt)

```
- phase: any
- health check requested or anomaly suspected
```

## Expected /af-next output

/af-doctor — run the 8-condition diagnostic and report fix commands

## Pass criterion

- /af-next outputs exactly `/af-doctor` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-doctor executed at this point is refused by the command guard with a redirect to /af-doctor.
