---
id: SF-14
command: /af-intake
map_phase: any
category: state-to-command
---

# SF-14 — State expects `/af-next` → /af-intake

## Given state (STATE.md excerpt)

```
- phase: any
- new user message just received
```

## Expected /af-next output

/af-intake — classify the user message before any action; no edits on chat

## Pass criterion

- /af-next outputs exactly `/af-intake` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-intake executed at this point is refused by the command guard with a redirect to /af-intake.
