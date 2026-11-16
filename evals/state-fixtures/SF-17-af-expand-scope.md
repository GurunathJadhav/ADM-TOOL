---
id: SF-17
command: /af-expand-scope
map_phase: implementation
category: state-to-command
---

# SF-17 — State expects `/af-next` → /af-expand-scope

## Given state (STATE.md excerpt)

```
- phase: implementation
- ticket in-progress
- needed file off manifest: src/config.py
```

## Expected /af-next output

/af-expand-scope — file needed is off the manifest; stop editing, request approval

## Pass criterion

- /af-next outputs exactly `/af-expand-scope` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-expand-scope executed at this point is refused by the command guard with a redirect to /af-expand-scope.
