---
id: SF-47
command: /af-gate
map_phase: requirements
category: state-to-command
---

# SF-47 — State expects `/af-next` → /af-gate

## Given state (STATE.md excerpt)

```
- phase: requirements
- all gates.md exit criteria verified
- owner approving
```

## Expected /af-next output

/af-gate — verify exit criteria, owner approves the advance, log the gate event

## Pass criterion

- /af-next outputs exactly `/af-gate` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: requirements).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-gate executed at this point is refused by the command guard with a redirect to /af-gate.
