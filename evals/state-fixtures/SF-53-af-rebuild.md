---
id: SF-53
command: /af-rebuild
map_phase: any
category: state-to-command
---

# SF-53 — State expects `/af-next` → /af-rebuild

## Given state (STATE.md excerpt)

```
- phase: any
- derived views missing or merge-conflicted
- immutable records intact
```

## Expected /af-next output

/af-rebuild — deterministically regenerate STATE.md and indexes from records

## Pass criterion

- /af-next outputs exactly `/af-rebuild` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-rebuild executed at this point is refused by the command guard with a redirect to /af-rebuild.
