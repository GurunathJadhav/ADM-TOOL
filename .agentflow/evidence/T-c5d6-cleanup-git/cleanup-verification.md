---
type: evidence
id: E-k8m9-cleanup-evidence
project_id: af-prj-0007-agentflow-self
schema_version: 1.0.0
created: 20261117T171500Z
actor: agent
role: agent
ticket_id: T-c5d6-cleanup-git
source_command: dir-absence checks; git log/status/ls-files; python tools/validate.py
truncated: false
---

# Evidence: cleanup + git init

## Removal checks (all re-confirmed by independent reviewer, 2026-11-17)
```
temp dirs left: 0        (af-install-test{,2,3} deleted)
scale exists: False      state-fixtures exists: False
bad-behaviour exists: False   wrong-command exists: False
pycache exists: False    alt validators: 0
gen helper removed: True (evals/_gen_golden.py)
```

## Git
```
4f41974 Agentflow v1.0.0 - Markdown agent-agnostic framework (MIT)
2022dbc Remove test artifacts: scale fixture, generated fixtures, superseded scenario sets, alternate validators
+ record-fix commit (see below); working tree clean after final commit
```
392 files tracked; no junk (pycache/scale/_gen_* tracked: 0 matches); `.gitignore` includes `__pycache__/`.

## Validation history
1. First post-manifest run: FAIL — manifest missing `allowed_to_modify`/`edit_budget`; fixed.
2. Second run: PASS on `.` and golden fixture (recorded in V-s5t6).
3. Review round 1 found two later-created records breaking the gate: evidence file lacked
   front matter; event id `E-t9u1-…` used excluded letter `u`. Both fixed (event renamed to
   `E-t9w2-…`, evidence given this front matter).
4. Final state (after record-fix commit `7e5f790`): outputs verified immediately after the commit:
```
python tools/validate.py .            → result: PASS (exit 0)   (41 record files scanned)
python tools/validate.py evals/golden-project → result: PASS (exit 0)
git log --oneline → 7e5f790 / 2022dbc / 4f41974 (3 commits)
git status --short → (empty) — tree clean: True
```
