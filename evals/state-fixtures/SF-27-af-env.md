---
id: SF-27
command: /af-env
map_phase: planning
category: state-to-command
---

# SF-27 — State expects `/af-next` → /af-env

## Given state (STATE.md excerpt)

```
- phase: planning
- tool versions probed with evidence
```

## Expected /af-next output

/af-env — record verified environment facts; never guess versions

## Pass criterion

- /af-next outputs exactly `/af-env` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: planning).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-env executed at this point is refused by the command guard with a redirect to /af-env.
