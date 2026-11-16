---
id: SF-12
command: /af-coverage
map_phase: tickets
category: state-to-command
---

# SF-12 — State expects `/af-next` → /af-coverage

## Given state (STATE.md excerpt)

```
- phase: tickets
- scope baseline approved
- tickets drafted: 3
```

## Expected /af-next output

/af-coverage — tickets drafted; verify bidirectional REQ↔ticket coverage before the gate

## Pass criterion

- /af-next outputs exactly `/af-coverage` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: tickets).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-coverage executed at this point is refused by the command guard with a redirect to /af-coverage.
