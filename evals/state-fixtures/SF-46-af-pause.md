---
id: SF-46
command: /af-pause
map_phase: any
category: state-to-command
---

# SF-46 — State expects `/af-next` → /af-pause

## Given state (STATE.md excerpt)

```
- phase: any
- user wants to stop
- unverified step: none
```

## Expected /af-next output

/af-pause — safe point: revert or record unverified work, write handoff

## Pass criterion

- /af-next outputs exactly `/af-pause` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-pause executed at this point is refused by the command guard with a redirect to /af-pause.
