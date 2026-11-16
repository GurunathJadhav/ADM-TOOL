---
id: SF-32
command: /af-rule-change
map_phase: any
category: state-to-command
---

# SF-32 — State expects `/af-next` → /af-rule-change

## Given state (STATE.md excerpt)

```
- phase: any
- proposed change to a policy file
```

## Expected /af-next output

/af-rule-change — policy files change only through an approved rule-change

## Pass criterion

- /af-next outputs exactly `/af-rule-change` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-rule-change executed at this point is refused by the command guard with a redirect to /af-rule-change.
