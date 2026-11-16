---
id: SF-31
command: /af-change
map_phase: any
category: state-to-command
---

# SF-31 — State expects `/af-next` → /af-change

## Given state (STATE.md excerpt)

```
- phase: any
- user requested a requirement change mid-project
```

## Expected /af-next output

/af-change — requirement changes go through the change-request flow; no direct edits

## Pass criterion

- /af-next outputs exactly `/af-change` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-change executed at this point is refused by the command guard with a redirect to /af-change.
