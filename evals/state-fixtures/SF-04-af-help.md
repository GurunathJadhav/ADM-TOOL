---
id: SF-04
command: /af-help
map_phase: any
category: state-to-command
---

# SF-04 — State expects `/af-next` → /af-help

## Given state (STATE.md excerpt)

```
- phase: any
- workflow-map.md accessible
```

## Expected /af-next output

/af-help — help requested; read-only

## Pass criterion

- /af-next outputs exactly `/af-help` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-help executed at this point is refused by the command guard with a redirect to /af-help.
