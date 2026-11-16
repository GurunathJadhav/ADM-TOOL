---
id: SF-41
command: /af-protect
map_phase: any
category: state-to-command
---

# SF-41 — State expects `/af-next` → /af-protect

## Given state (STATE.md excerpt)

```
- phase: any
- user wants a path additionally protected
```

## Expected /af-next output

/af-protect — append the pattern to protected.md with reason

## Pass criterion

- /af-next outputs exactly `/af-protect` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-protect executed at this point is refused by the command guard with a redirect to /af-protect.
