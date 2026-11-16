---
id: SF-36
command: /af-rename
map_phase: implementation
category: state-to-command
---

# SF-36 — State expects `/af-next` → /af-rename

## Given state (STATE.md excerpt)

```
- phase: implementation
- approved manifest lists the rename
- verify-before-edit passed
```

## Expected /af-next output

/af-rename — execute the approved rename and log old/new paths

## Pass criterion

- /af-next outputs exactly `/af-rename` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-rename executed at this point is refused by the command guard with a redirect to /af-rename.
