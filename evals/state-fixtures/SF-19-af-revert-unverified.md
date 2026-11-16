---
id: SF-19
command: /af-revert-unverified
map_phase: implementation
category: state-to-command
---

# SF-19 — State expects `/af-next` → /af-revert-unverified

## Given state (STATE.md excerpt)

```
- phase: implementation
- unverified step: verification failed, fix within step not possible
```

## Expected /af-next output

/af-revert-unverified — step failed; restore baseline rather than stacking edits

## Pass criterion

- /af-next outputs exactly `/af-revert-unverified` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-revert-unverified executed at this point is refused by the command guard with a redirect to /af-revert-unverified.
