---
id: SF-39
command: /af-blockers
map_phase: any
category: state-to-command
---

# SF-39 — State expects `/af-next` → /af-blockers

## Given state (STATE.md excerpt)

```
- phase: any
- human must supply credentials; dependent ticket blocked
```

## Expected /af-next output

/af-blockers — record the human blocker and route to unblocked work

## Pass criterion

- /af-next outputs exactly `/af-blockers` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-blockers executed at this point is refused by the command guard with a redirect to /af-blockers.
