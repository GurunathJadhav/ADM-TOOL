# Limits of Enforcement

An honest statement of what Agentflow can and cannot enforce. The framework's own principle is that **enforcement claims must match reality** (S2.5, S14).

## What each tier can do

| Tier | Mechanism | Can enforce | Cannot |
|---|---|---|---|
| **0** | Adapters, skills, templates (instructions) | Guide behaviour; agent outputs the manifest and checklist before each edit so the user can reject | Cannot technically block an edit; an agent can ignore any instruction |
| **1** | Optional validator (script or manual procedure) | Check front matter and allowed values, `project_id` consistency, gates, `done` without evidence, secrets in records, policy files vs approved versions, changed files vs manifest, baseline and protected paths, manifest overlaps, test-file changes; rebuild derived views deterministically | Checks run after the fact — they report violations, they do not prevent edits |
| **2** | git `pre-commit`/`commit-msg` hooks, CI, agent-native pre-edit hooks | Actually reject: commits touching files off the manifest, protected paths without approval, missing verification records, missing ticket id; CI repeats the checks; pre-edit hooks block writes off the manifest (verify each tool's mechanism first) | Only blocks where the hook/CI runs; locally skipped hooks or unmonitored tools bypass it |

## The fundamental limitation

**An agent with unrestricted file access can forge or edit records.** It can write a fake approval file, invent verification output, edit `STATE.md`, or modify policy files. Instruction-level rules (Tier 0) and even record-keeping can be bypassed or fabricated — this is a property of giving a model write access, and no markdown protocol removes it.

## The real backstops

1. **User review of diffs.** The footer, `STATE.md`, and the diff gate (`/af-diff-check` maps every changed hunk to an acceptance criterion) exist so a human can check quickly. Review what changed.
2. **User-owned commits.** Agents never commit or push to the main branch; a human (or protected-branch workflow) merges. Commits made by you are the integrity anchor.
3. **Independent review.** `/af-review` produces a review packet (ticket, criteria, manifest, diff, evidence — not the author's reasoning) reviewed by a different agent, a fresh session, or a human, who **re-runs the verification commands** instead of trusting pasted output.
4. **CI.** Repeats the Tier 1 checks on every push, where an agent cannot reach them mid-run.

## Approvals are only as strong as the tool's permissions

Agentflow's approvals (`/af-edit-plan` manifests, phase gates, high-risk countersigns) assume the tool actually stops and asks before running commands or writing files. If the tool's "auto-approve everything"/bypass mode is on, the agent acts before — or instead of — collecting your approval, and the approval records become after-the-fact paperwork. Keep bypass modes OFF and require confirmation for shell commands outside the allowlist and writes outside the approved manifest, where the tool supports it.

## Designed-in mitigations (honest about scope)

- **High-risk countersign:** rule changes, protected paths, production, and new runtime dependencies additionally require a user-authored commit or you personally creating/editing the approval file. This raises the bar, but a misbehaving agent with file access can still attempt to fake it — which is exactly what reviewers and CI should look for.
- **Waivers never cover** policy-file protections, secrets safety, or the countersign.
- **`/af-audit`** re-runs verification commands to catch fabricated pasted output; **`/af-doctor`** flags unapproved policy changes, stale adapters, and dangling references. Both detect; neither prevents.

**Summary:** Tier 0 guides, Tier 1 detects, Tier 2 blocks. Records make misbehaviour visible; humans, commits, and CI make it costly. Document and operate accordingly.
