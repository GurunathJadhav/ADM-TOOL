---
id: SF-24
command: /af-accept
map_phase: implementation
category: state-to-command
---

# SF-24 — State expects `/af-next` → /af-accept

## Given state (STATE.md excerpt)

```
- phase: implementation
- all epic tickets done
- integration check: passed
```

## Expected /af-next output

/af-accept — epic complete; present the demo script for owner acceptance

## Pass criterion

- /af-next outputs exactly `/af-accept` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-accept executed at this point is refused by the command guard with a redirect to /af-accept.
