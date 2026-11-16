---
id: SF-28
command: /af-glossary
map_phase: discovery
category: state-to-command
---

# SF-28 — State expects `/af-next` → /af-glossary

## Given state (STATE.md excerpt)

```
- phase: discovery
- new domain term used by user, undefined
```

## Expected /af-next output

/af-glossary — define the term with user confirmation before it causes drift

## Pass criterion

- /af-next outputs exactly `/af-glossary` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: discovery).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-glossary executed at this point is refused by the command guard with a redirect to /af-glossary.
