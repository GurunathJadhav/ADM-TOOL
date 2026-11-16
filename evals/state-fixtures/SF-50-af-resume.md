---
id: SF-50
command: /af-resume
map_phase: any
category: state-to-command
---

# SF-50 — State expects `/af-next` → /af-resume

## Given state (STATE.md excerpt)

```
- phase: any
- fresh session; handoff exists
- built_from matches newest event
```

## Expected /af-next output

/af-resume — re-ground on STATE.md invariants, then continue with next_action

## Pass criterion

- /af-next outputs exactly `/af-resume` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-resume executed at this point is refused by the command guard with a redirect to /af-resume.
