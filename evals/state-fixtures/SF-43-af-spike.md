---
id: SF-43
command: /af-spike
map_phase: tickets
category: state-to-command
---

# SF-43 — State expects `/af-next` → /af-spike

## Given state (STATE.md excerpt)

```
- phase: tickets
- unknown requires time-boxed investigation
```

## Expected /af-next output

/af-spike — isolate the experiment in spikes/, write the conclusion

## Pass criterion

- /af-next outputs exactly `/af-spike` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: tickets).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than /af-spike executed at this point is refused by the command guard with a redirect to /af-spike.
