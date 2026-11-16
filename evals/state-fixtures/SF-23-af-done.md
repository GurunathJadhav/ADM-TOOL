---
id: SF-23
command: /af-done
map_phase: implementation
category: state-to-command
---

# SF-23 — State expects `/af-next` → /af-done

## Given state (STATE.md excerpt)

```
- phase: implementation
- criteria verified, diff mapped, regression green, review approved
```

## Expected /af-next output

/af-done — all gates green; freeze files and close the ticket

## Pass criterion

- /af-next outputs exactly `/af-done` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-done executed at this point is refused by the command guard with a redirect to /af-done.
