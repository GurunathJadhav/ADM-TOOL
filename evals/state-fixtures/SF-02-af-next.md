---
id: SF-02
command: /af-next
map_phase: any
category: state-to-command
---

# SF-02 — State expects `/af-next` → /af-next

## Given state (STATE.md excerpt)

```
- phase: any
- state readable
```

## Expected /af-next output

/af-next — always valid once STATE.md exists; it is the router itself

## Pass criterion

- /af-next outputs exactly `/af-next` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-next executed at this point is refused by the command guard with a redirect to /af-next.
