---
name: tdd-implementation
description: Use when implementing any ticket change so edits follow the micro-cycle and manifest discipline with verify-before-edit, reproduce-first, and one verification record per step.
version: 1.0.0
---

# TDD Implementation

## Purpose
Implement changes one logical change at a time inside the micro-cycle: edit → relevant checks → evidence → next. Every step stays inside the approved manifest, every feature starts from a failing test, every bug is reproduced before it is fixed, and nothing is stacked on an unverified edit.

## When to Use
- Implementing any ticket step from an approved manifest `manifests/T-<id>.md`.
- Fixing a bug reported by a failed regression run.
- Any source edit, regardless of size or "triviality".

## Inputs
- Approved manifest `manifests/T-<id>.md` and baseline `baselines/T-<id>.md`.
- Ticket acceptance criteria and test commands from `environment/`.
- Current file contents.

## Steps
1. **Micro-cycle per step:** one logical change → run the relevant checks → capture evidence (`/af-verify`) → next step. Default unverified limit: one file or ~50 lines (adjust per strictness profile).
2. **Verify-before-edit checklist for every manifest file:**
   - Read the current file — do not edit from memory.
   - Confirm every function, type, API, or config key you plan to use actually exists.
   - List the callers of what you are changing.
3. **Features — red first:** a failing test must exist and be seen failing BEFORE implementing. Then implement to green. A test never seen failing is not evidence.
4. **Bugs — reproduce first:** reproduce the bug (failing test or recorded output) and state the cause before ANY source edit. The reproduce-first rule is mandatory.
5. **Never stack edits on unverified ones.** One unverified step exists at a time; verify or revert before the next edit.
6. **On failure:** fix within the current step and re-verify, or run `/af-revert-unverified` back to the step baseline. After 3 failures, STOP and run `/af-stuck`.
7. **Complete the step only when all hold:**
   - Relevant tests pass with pasted output in an evidence record.
   - Build, lint, and typecheck pass.
   - The diff matches the approved manifest exactly.
   - One verification record `verifications/V-<id>.md` written.
8. **Advance:** next manifest step, or `/af-diff-check` when all steps are done.

## Checklist
- [ ] Step fits the unverified limit (one file or ~50 lines, per strictness).
- [ ] Verify-before-edit done: file read, APIs confirmed to exist, callers listed.
- [ ] Feature: failing test seen failing first. Bug: reproduced with cause stated first.
- [ ] No second edit made while the current one is unverified.
- [ ] Relevant tests pass with pasted output; build/lint/typecheck pass.
- [ ] Diff matches the manifest; one `verifications/V-<id>.md` written.
- [ ] Failure ≤3 attempts; otherwise `/af-revert-unverified` or `/af-stuck`.

## Anti-Patterns
- Writing the implementation and the test together, then "verifying" both at once.
- Claiming red-green without ever showing the test failing.
- Fixing a bug by reasoning about it without reproducing it.
- Stacking "small" follow-up edits on an unverified step.
- Broadening the diff beyond the manifest to fix something noticed in passing — use a new ticket.

## "Stop and Ask the User If…"
- The step needs to exceed the unverified limit and the strictness profile forbids it.
- You cannot reproduce the bug locally (environment gap, missing credentials).
- Three fix attempts failed for the same step.
- The manifest's file list turns out to be wrong for the change actually needed.

## Next Skills
- testing-strategy
- refactoring
- project-scaffolding
- lean-architecture

## Worked Example
Ticket T-i0j1-username-trim. Manifest allows `src/user.ts` + `src/user.test.ts`. Step 1: read both files; `normalizeUsername` exists, called from `register.ts` (verify-before-edit). Feature, red first: add test `trims surrounding spaces`, run `npm test -- user.test.ts` → fails with pasted output. Implement one-line `.trim()`. `/af-verify`: test green, `tsc --noEmit` and lint pass, diff matches manifest → `verifications/V-k1l2-trim-step.md` as `pass`, unverified lock cleared. Next step begins on a clean, verified baseline.
