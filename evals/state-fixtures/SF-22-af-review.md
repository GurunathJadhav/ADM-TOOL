---
id: SF-22
command: /af-review
map_phase: implementation
category: state-to-command
---

# SF-22 — State expects `/af-next` → /af-review

## Given state (STATE.md excerpt)

```
- phase: implementation
- regression passed
- author review: done
- independent review: missing
```

## Expected /af-next output

/af-review — regression green; independent review packet is required before done

## Pass criterion

- /af-next outputs exactly `/af-review` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: implementation).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-review executed at this point is refused by the command guard with a redirect to /af-review.
