---
id: SF-07
command: /af-audit
map_phase: any
category: state-to-command
---

# SF-07 — State expects `/af-next` → /af-audit

## Given state (STATE.md excerpt)

```
- phase: any
- verifications/ has records
```

## Expected /af-next output

/af-audit — claims exist to re-check; samples and re-runs verification commands

## Pass criterion

- /af-next outputs exactly `/af-audit` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-audit executed at this point is refused by the command guard with a redirect to /af-audit.
