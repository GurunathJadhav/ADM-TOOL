---
id: SF-48
command: /af-release-check
map_phase: release
category: state-to-command
---

# SF-48 — State expects `/af-next` → /af-release-check

## Given state (STATE.md excerpt)

```
- phase: release
- all Must tickets accepted
- blockers on Must tickets: 0
```

## Expected /af-next output

/af-release-check — verify quality profile, release note, rollback note before the release gate

## Pass criterion

- /af-next outputs exactly `/af-release-check` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: release).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-release-check executed at this point is refused by the command guard with a redirect to /af-release-check.
