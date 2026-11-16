---
id: SF-42
command: /af-label
map_phase: any
category: state-to-command
---

# SF-42 — State expects `/af-next` → /af-label

## Given state (STATE.md excerpt)

```
- phase: any
- inferred fact now has evidence reference
```

## Expected /af-next output

/af-label — promote the fact to verified; inferred facts cannot justify edits

## Pass criterion

- /af-next outputs exactly `/af-label` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-label executed at this point is refused by the command guard with a redirect to /af-label.
