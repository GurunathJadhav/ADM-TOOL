---
id: SF-45
command: /af-sync
map_phase: any
category: state-to-command
---

# SF-45 — State expects `/af-next` → /af-sync

## Given state (STATE.md excerpt)

```
- phase: any
- working tree differs from built_from (external edits)
```

## Expected /af-next output

/af-sync — detect and log external changes; re-read affected files

## Pass criterion

- /af-next outputs exactly `/af-sync` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-sync executed at this point is refused by the command guard with a redirect to /af-sync.
