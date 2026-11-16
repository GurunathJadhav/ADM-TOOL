---
id: SF-20
command: /af-diff-check
map_phase: implementation
category: state-to-command
---

# SF-20 — State expects `/af-next` → /af-diff-check

## Given state (STATE.md excerpt)

```
- phase: implementation
- all steps verified: yes
- unverified step: none
```

## Expected /af-next output

/af-diff-check — all steps verified; map every hunk to a criterion before regression

## Pass criterion

- /af-next outputs exactly `/af-diff-check` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-diff-check executed at this point is refused by the command guard with a redirect to /af-diff-check.
