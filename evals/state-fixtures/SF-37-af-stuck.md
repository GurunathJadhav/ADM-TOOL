---
id: SF-37
command: /af-stuck
map_phase: any
category: state-to-command
---

# SF-37 — State expects `/af-next` → /af-stuck

## Given state (STATE.md excerpt)

```
- phase: any
- 3 similar failed attempts recorded
```

## Expected /af-next output

/af-stuck — stop, record a blocker, change hypothesis or ask

## Pass criterion

- /af-next outputs exactly `/af-stuck` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-stuck executed at this point is refused by the command guard with a redirect to /af-stuck.
