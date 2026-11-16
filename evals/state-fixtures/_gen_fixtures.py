#!/usr/bin/env python3
"""Generate 54 state-to-command fixtures (one per workflow-map row, S11.8).

Each fixture states a concrete STATE.md-like state realising the row's Situation,
and the exact /af-next recommendation a compliant agent must produce.
Run:  python _gen_fixtures.py
"""
import os

OUT = r"C:\Users\User\Desktop\ADM-Tool\evals\state-fixtures"

# (command, phase, state excerpt lines, expected /af-next answer + why)
ROWS = [
 ("/af-start", "none", ["(no .agentflow/ directory exists)", "workspace writable, no project.md"],
  "/af-start — no .agentflow/ exists; declare tier, propose defaults sheet, owner approves, create project.md"),
 ("/af-next", "any", ["phase: any", "state readable"],
  "/af-next — always valid once STATE.md exists; it is the router itself"),
 ("/af-why", "any", ["phase: any", "recent event available"],
  "/af-why — explanation requested; read-only, returns to next_action afterwards"),
 ("/af-help", "any", ["phase: any", "workflow-map.md accessible"],
  "/af-help — help requested; read-only"),
 ("/af-status", "any", ["phase: any", "STATE.md readable"],
  "/af-status — status requested; read-only"),
 ("/af-report", "any", ["phase: any", "tickets/ and events/ populated"],
  "/af-report — human summary requested; records exist to summarise"),
 ("/af-audit", "any", ["phase: any", "verifications/ has records"],
  "/af-audit — claims exist to re-check; samples and re-runs verification commands"),
 ("/af-ask", "discovery", ["phase: discovery", "open blocking questions: 2"],
  "/af-ask — blocking questions open in discovery; ask batched, blocking first"),
 ("/af-assume", "discovery", ["phase: discovery", "non-blocking question with reasonable default, unconfirmed"],
  "/af-assume — record the assumption and obtain user confirmation before it counts"),
 ("/af-confirm-understanding", "discovery", ["phase: discovery", "open blocking questions: 0", "unconfirmed assumptions: 0"],
  "/af-confirm-understanding — all blocking closed; summarise understanding for explicit confirmation"),
 ("/af-requirements", "requirements", ["phase: requirements", "understanding confirmed (A-record exists)"],
  "/af-requirements — discovery confirmed; create the requirements baseline"),
 ("/af-coverage", "tickets", ["phase: tickets", "scope baseline approved", "tickets drafted: 3"],
  "/af-coverage — tickets drafted; verify bidirectional REQ↔ticket coverage before the gate"),
 ("/af-ticket", "tickets", ["phase: tickets", "requirements baseline approved", "uncovered requirement: REQ-x"],
  "/af-ticket — create a ticket per requirement; baseline exists"),
 ("/af-intake", "any", ["phase: any", "new user message just received"],
  "/af-intake — classify the user message before any action; no edits on chat"),
 ("/af-edit-plan", "implementation", ["phase: implementation", "active ticket: claimed, no manifest", "edit lock: locked"],
  "/af-edit-plan — ticket claimed without a manifest; the manifest gate precedes any edit"),
 ("/af-start-ticket", "implementation", ["phase: implementation", "manifest approved for active ticket", "unverified step: none"],
  "/af-start-ticket — manifest approved; record baseline and unlock the edit lock"),
 ("/af-expand-scope", "implementation", ["phase: implementation", "ticket in-progress", "needed file off manifest: src/config.py"],
  "/af-expand-scope — file needed is off the manifest; stop editing, request approval"),
 ("/af-verify", "implementation", ["phase: implementation", "active ticket in-progress", "unverified step: 1 file, ~30 lines"],
  "/af-verify — an unverified step exists; run checks, record evidence, clear or revert"),
 ("/af-revert-unverified", "implementation", ["phase: implementation", "unverified step: verification failed, fix within step not possible"],
  "/af-revert-unverified — step failed; restore baseline rather than stacking edits"),
 ("/af-diff-check", "implementation", ["phase: implementation", "all steps verified: yes", "unverified step: none"],
  "/af-diff-check — all steps verified; map every hunk to a criterion before regression"),
 ("/af-regression", "implementation", ["phase: implementation", "diff check passed", "regression since last run: pending"],
  "/af-regression — diff clean; run the wider regression set before review"),
 ("/af-review", "implementation", ["phase: implementation", "regression passed", "author review: done", "independent review: missing"],
  "/af-review — regression green; independent review packet is required before done"),
 ("/af-done", "implementation", ["phase: implementation", "criteria verified, diff mapped, regression green, review approved"],
  "/af-done — all gates green; freeze files and close the ticket"),
 ("/af-accept", "implementation", ["phase: implementation", "all epic tickets done", "integration check: passed"],
  "/af-accept — epic complete; present the demo script for owner acceptance"),
 ("/af-retro", "implementation", ["phase: implementation", "epic accepted (A-record exists)"],
  "/af-retro — epic accepted; capture lessons while fresh"),
 ("/af-decide", "planning", ["phase: planning", "options identified for a technical choice", "simplicity gate evaluated"],
  "/af-decide — record the ADR with options and trade-offs"),
 ("/af-env", "planning", ["phase: planning", "tool versions probed with evidence"],
  "/af-env — record verified environment facts; never guess versions"),
 ("/af-glossary", "discovery", ["phase: discovery", "new domain term used by user, undefined"],
  "/af-glossary — define the term with user confirmation before it causes drift"),
 ("/af-lesson", "any", ["phase: any", "mistake analysed or insight validated"],
  "/af-lesson — record the lesson linked to its ticket"),
 ("/af-log", "any", ["phase: any", "state change occurred without its event yet"],
  "/af-log — write the event for the state change (write-ahead rule applies)"),
 ("/af-change", "any", ["phase: any", "user requested a requirement change mid-project"],
  "/af-change — requirement changes go through the change-request flow; no direct edits"),
 ("/af-rule-change", "any", ["phase: any", "proposed change to a policy file"],
  "/af-rule-change — policy files change only through an approved rule-change"),
 ("/af-strictness", "any", ["phase: any", "owner asked to change strictness level"],
  "/af-strictness — strictness changes are rule changes with countersign"),
 ("/af-lane-change", "any", ["phase: any", "active ticket, lane mismatch discovered, justification available"],
  "/af-lane-change — moving to a lane with a different done-definition needs approval"),
 ("/af-reopen", "any", ["phase: any", "done ticket T-x regressed", "linked bug ticket: exists"],
  "/af-reopen — reopen with the linked bug ticket; unfreeze only fix manifest files"),
 ("/af-rename", "implementation", ["phase: implementation", "approved manifest lists the rename", "verify-before-edit passed"],
  "/af-rename — execute the approved rename and log old/new paths"),
 ("/af-stuck", "any", ["phase: any", "3 similar failed attempts recorded"],
  "/af-stuck — stop, record a blocker, change hypothesis or ask"),
 ("/af-incident", "any", ["phase: any", "secret exposed in chat / production broken"],
  "/af-incident — incident lane: reproduce, minimal fix, mandatory follow-up ticket"),
 ("/af-blockers", "any", ["phase: any", "human must supply credentials; dependent ticket blocked"],
  "/af-blockers — record the human blocker and route to unblocked work"),
 ("/af-waive", "any", ["phase: any", "owner wants a non-safety rule skipped this once"],
  "/af-waive — record the waiver with verbatim words and expiry (never safety/policy)"),
 ("/af-protect", "any", ["phase: any", "user wants a path additionally protected"],
  "/af-protect — append the pattern to protected.md with reason"),
 ("/af-label", "any", ["phase: any", "inferred fact now has evidence reference"],
  "/af-label — promote the fact to verified; inferred facts cannot justify edits"),
 ("/af-spike", "tickets", ["phase: tickets", "unknown requires time-boxed investigation"],
  "/af-spike — isolate the experiment in spikes/, write the conclusion"),
 ("/af-approvals", "any", ["phase: any", "2 manifests + 1 rule-change awaiting humans"],
  "/af-approvals — batch pending approvals into APPROVALS-NEEDED.md"),
 ("/af-sync", "any", ["phase: any", "working tree differs from built_from (external edits)"],
  "/af-sync — detect and log external changes; re-read affected files"),
 ("/af-pause", "any", ["phase: any", "user wants to stop", "unverified step: none"],
  "/af-pause — safe point: revert or record unverified work, write handoff"),
 ("/af-gate", "requirements", ["phase: requirements", "all gates.md exit criteria verified", "owner approving"],
  "/af-gate — verify exit criteria, owner approves the advance, log the gate event"),
 ("/af-release-check", "release", ["phase: release", "all Must tickets accepted", "blockers on Must tickets: 0"],
  "/af-release-check — verify quality profile, release note, rollback note before the release gate"),
 ("/af-handoff", "any", ["phase: any", "session ending, STATE.md current"],
  "/af-handoff — write handoff/<date>.md for the fresh agent"),
 ("/af-resume", "any", ["phase: any", "fresh session; handoff exists", "built_from matches newest event"],
  "/af-resume — re-ground on STATE.md invariants, then continue with next_action"),
 ("/af-undo-plan", "planning", ["phase: planning", "approved plan must be rolled back", "no permanent code changes"],
  "/af-undo-plan — supersede the plan via correction event; never delete records"),
 ("/af-reconcile", "any", ["phase: any", "duplicate records / log-vs-disk divergence observed"],
  "/af-reconcile — correction events for duplicates; rebuild derived views"),
 ("/af-rebuild", "any", ["phase: any", "derived views missing or merge-conflicted", "immutable records intact"],
  "/af-rebuild — deterministically regenerate STATE.md and indexes from records"),
 ("/af-doctor", "any", ["phase: any", "health check requested or anomaly suspected"],
  "/af-doctor — run the 8-condition diagnostic and report fix commands"),
]

HEADER = """---
id: SF-%02d
command: %s
map_phase: %s
category: state-to-command
---

# SF-%02d — State expects `/af-next` → %s

## Given state (STATE.md excerpt)

```
%s
```

## Expected /af-next output

%s

## Pass criterion

- /af-next outputs exactly `%s` as the recommended next command with the reason above.
- The recommendation cites the workflow-map row (phase: %s).
- No records are modified by the recommendation itself (read-only routing).
- Any command other than %s executed at this point is refused by the command guard with a redirect to %s.
"""

os.makedirs(OUT, exist_ok=True)
for i, (cmd, phase, lines, expect) in enumerate(ROWS, 1):
    body = "\n".join("- " + l for l in lines)
    text = HEADER % (i, cmd, phase, i, cmd, body, expect, cmd, phase, cmd, cmd)
    path = os.path.join(OUT, "SF-%02d%s.md" % (i, cmd.replace("/", "-")))
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
print("fixtures written:", len(ROWS))
