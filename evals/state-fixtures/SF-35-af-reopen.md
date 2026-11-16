---
id: SF-35
command: /af-reopen
map_phase: any
category: state-to-command
---

# SF-35 — State expects `/af-next` → /af-reopen

## Given state (STATE.md excerpt)

```
- phase: any
- done ticket T-x regressed
- linked bug ticket: exists
```

## Expected /af-next output

/af-reopen — reopen with the linked bug ticket; unfreeze only fix manifest files

## Pass criterion

- /af-next outputs exactly `/af-reopen` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-reopen executed at this point is refused by the command guard with a redirect to /af-reopen.
