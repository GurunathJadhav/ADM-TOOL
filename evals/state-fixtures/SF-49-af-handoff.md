---
id: SF-49
command: /af-handoff
map_phase: any
category: state-to-command
---

# SF-49 — State expects `/af-next` → /af-handoff

## Given state (STATE.md excerpt)

```
- phase: any
- session ending, STATE.md current
```

## Expected /af-next output

/af-handoff — write handoff/<date>.md for the fresh agent

## Pass criterion

- /af-next outputs exactly `/af-handoff` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-handoff executed at this point is refused by the command guard with a redirect to /af-handoff.
