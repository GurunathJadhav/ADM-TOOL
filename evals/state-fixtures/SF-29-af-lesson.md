---
id: SF-29
command: /af-lesson
map_phase: any
category: state-to-command
---

# SF-29 — State expects `/af-next` → /af-lesson

## Given state (STATE.md excerpt)

```
- phase: any
- mistake analysed or insight validated
```

## Expected /af-next output

/af-lesson — record the lesson linked to its ticket

## Pass criterion

- /af-next outputs exactly `/af-lesson` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: any).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-lesson executed at this point is refused by the command guard with a redirect to /af-lesson.
