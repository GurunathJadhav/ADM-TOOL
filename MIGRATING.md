# Migrating Between Framework Versions

Records carry `schema_version` and `project.md` carries `framework_version`, so any project can be
upgraded safely. Rule: **backup and dry-run first, never migrate in place without a copy.**

## Procedure

1. **Backup:** copy the whole `.agentflow/` directory (it is plain Markdown — a folder copy is a
   complete backup).
2. **Dry run:** run the new version's installer with `--dry-run` and read the change list. Shared
   files that would be added are listed as `create`; files you have are listed as `skip`.
3. **Diff, don't replace:** on upgrade, show a diff against project overrides rather than silently
   replacing them (S18). If a shared skill changed and your project never overrode it, accept the
   update; if you overrode it, decide per file and keep your override visible.
4. **Migrate records only if `schema_version` changed:** schema upgrades are scripted in the
   release notes as explicit find/replace or front-matter additions. Records are never rewritten
   silently — a migration that touches records is documented here per release and is itself
   reviewable.
5. **Validate:** run `python tools/validate.py <project>` after migrating; fix any
   `schema_version` or required-field errors it reports.
6. **Stamp:** update `framework_version` in `project.md` and log a `framework-upgrade` event:
   `events/<UTC>-none-framework-upgraded-<id>.md`.

## Version history

| From → To | Record schema changes | Action |
|---|---|---|
| 1.0.0 → 1.0.0 | none | install only missing files; refresh managed blocks |

## Rollback

Restore the `.agentflow/` backup copy (step 1). Because derived views are disposable, also delete
and rebuild `STATE.md` and indexes with `/af-rebuild` after any restore.
