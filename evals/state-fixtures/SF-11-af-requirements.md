---
id: SF-11
command: /af-requirements
map_phase: requirements
category: state-to-command
---

# SF-11 — State expects `/af-next` → /af-requirements

## Given state (STATE.md excerpt)

```
- phase: requirements
- understanding confirmed (A-record exists)
```

## Expected /af-next output

/af-requirements — discovery confirmed; create the requirements baseline

## Pass criterion

- /af-next outputs exactly `/af-requirements` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: requirements).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-requirements executed at this point is refused by the command guard with a redirect to /af-requirements.
