---
id: SF-09
command: /af-assume
map_phase: discovery
category: state-to-command
---

# SF-09 — State expects `/af-next` → /af-assume

## Given state (STATE.md excerpt)

```
- phase: discovery
- non-blocking question with reasonable default, unconfirmed
```

## Expected /af-next output

/af-assume — record the assumption and obtain user confirmation before it counts

## Pass criterion

- /af-next outputs exactly `/af-assume` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: discovery).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-assume executed at this point is refused by the command guard with a redirect to /af-assume.
