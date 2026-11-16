---
id: SF-18
command: /af-verify
map_phase: implementation
category: state-to-command
---

# SF-18 — State expects `/af-next` → /af-verify

## Given state (STATE.md excerpt)

```
- phase: implementation
- active ticket in-progress
- unverified step: 1 file, ~30 lines
```

## Expected /af-next output

/af-verify — an unverified step exists; run checks, record evidence, clear or revert

## Pass criterion

- /af-next outputs exactly `/af-verify` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-verify executed at this point is refused by the command guard with a redirect to /af-verify.
