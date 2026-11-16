---
id: SF-44
command: /af-approvals
map_phase: any
category: state-to-command
---

# SF-44 — State expects `/af-next` → /af-approvals

## Given state (STATE.md excerpt)

```
- phase: any
- 2 manifests + 1 rule-change awaiting humans
```

## Expected /af-next output

/af-approvals — batch pending approvals into APPROVALS-NEEDED.md

## Pass criterion

- /af-next outputs exactly `/af-approvals` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-approvals executed at this point is refused by the command guard with a redirect to /af-approvals.
