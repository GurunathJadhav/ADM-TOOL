#!/bin/sh
# Agentflow Tier-1 POSIX Shell Validator
# Single-file, zero-dependency. Uses only POSIX utilities: sh, grep, sed, awk, find, test.
#
# Usage:
#   ./validate.sh [path-to-project-or-.agentflow] [all|frontmatter|secrets|manifest|gates]
#
# Exit codes: 0 = pass, 1 = failure (errors found).

set -u

TARGET="${1:-.}"
CHECK="${2:-all}"

ERRORS=0
WARNINGS=0

log_error() {
  echo "ERROR  $1: $2"
  ERRORS=$((ERRORS + 1))
}

log_warn() {
  echo "WARN   $1: $2"
  WARNINGS=$((WARNINGS + 1))
}

log_note() {
  echo "note   $1"
}

# Resolve paths
if [ -d "$TARGET/.agentflow" ]; then
  ROOT_DIR="$TARGET"
  AF_DIR="$TARGET/.agentflow"
elif [ "$(basename "$TARGET")" = ".agentflow" ] && [ -d "$TARGET" ]; then
  ROOT_DIR="$(dirname "$TARGET")"
  AF_DIR="$TARGET"
elif [ -f "$TARGET/project.md" ]; then
  ROOT_DIR="$(dirname "$TARGET")"
  AF_DIR="$TARGET"
else
  ROOT_DIR="$TARGET"
  AF_DIR="$TARGET/.agentflow"
fi

if [ ! -d "$AF_DIR" ]; then
  log_error "$ROOT_DIR" "no .agentflow/ directory found at $AF_DIR — run /af-start first"
  echo "result: FAIL (exit 1)"
  exit 1
fi

PROJECT_FILE="$AF_DIR/project.md"
PROJECT_ID=""
if [ -f "$PROJECT_FILE" ]; then
  PROJECT_ID=$(grep -E '^[[:space:]]*project_id:' "$PROJECT_FILE" | head -n1 | sed -E 's/^[[:space:]]*project_id:[[:space:]]*//; s/["'\'']//g; s/[[:space:]]*$//')
  if echo "$PROJECT_ID" | grep -q '^<'; then
    log_warn "$PROJECT_FILE" "project_id not configured yet: $PROJECT_ID"
    PROJECT_ID=""
  fi
else
  log_error "$AF_DIR" "required policy file missing: project.md"
fi

# ---------------------------------------------------------------- 1. Frontmatter
check_frontmatter() {
  log_note "running frontmatter and required fields checks..."
  RECORD_DIRS="tickets questions decisions manifests baselines verifications approvals claims blockers reviews requirements glossary risks lessons environment waivers evidence events"

  SCANNED=0
  for dir in $RECORD_DIRS; do
    SUBDIR="$AF_DIR/$dir"
    if [ ! -d "$SUBDIR" ]; then
      continue
    fi

    # Loop over all markdown files in directory
    for file in "$SUBDIR"/*.md; do
      if [ ! -f "$file" ]; then
        continue
      fi
      SCANNED=$((SCANNED + 1))

      # Check starts with ---
      FIRST_LINE=$(head -n 1 "$file")
      if [ "$FIRST_LINE" != "---" ]; then
        log_error "$file" "must start with ---"
        continue
      fi

      # Check closing ---
      CLOSING_COUNT=$(grep -c -E '^---[[:space:]]*$' "$file")
      if [ "$CLOSING_COUNT" -lt 2 ]; then
        log_error "$file" "front-matter block never closes (missing second ---)"
        continue
      fi

      # Extract frontmatter block
      FM=$(sed -n '1d; /^---/q; p' "$file")

      # Required common fields: type, id, project_id, schema_version, created, actor, role
      for req in type id project_id schema_version created actor role; do
        if ! echo "$FM" | grep -q -E "^[[:space:]]*$req:"; then
          log_error "$file" "missing required common field: $req"
        fi
      done

      # Check ID format: <Prefix>-<4 base32>-<slug>
      FILE_ID=$(echo "$FM" | grep -E '^[[:space:]]*id:' | head -n 1 | sed -E 's/^[[:space:]]*id:[[:space:]]*//; s/["'\'']//g')
      if [ -n "$FILE_ID" ]; then
        if ! echo "$FILE_ID" | grep -q -E '^[A-Z]{1,5}-[0-9a-km-np-tv-z]{4}-[a-z0-9-]{1,50}$'; then
          log_error "$file" "id does not match <Prefix>-<4 base32>-<slug>: $FILE_ID"
        fi
      fi

      # Check timestamp format
      FILE_CREATED=$(echo "$FM" | grep -E '^[[:space:]]*created:' | head -n 1 | sed -E 's/^[[:space:]]*created:[[:space:]]*//; s/["'\'']//g')
      if [ "$FILE_CREATED" = "unknown" ]; then
        log_warn "$file" "created: unknown — flagged until clock backfills it"
      elif [ -n "$FILE_CREATED" ]; then
        if ! echo "$FILE_CREATED" | grep -q -E '^[0-9]{8}T[0-9]{6}Z$'; then
          log_error "$file" "created timestamp is not compact UTC (YYYYMMDDTHHMMSSZ): $FILE_CREATED"
        fi
      fi

      # Check project_id consistency
      if [ -n "$PROJECT_ID" ]; then
        FILE_PID=$(echo "$FM" | grep -E '^[[:space:]]*project_id:' | head -n 1 | sed -E 's/^[[:space:]]*project_id:[[:space:]]*//; s/["'\'']//g')
        if [ -n "$FILE_PID" ] && [ "$FILE_PID" != "$PROJECT_ID" ]; then
          log_error "$file" "project_id mismatch: $FILE_PID != $PROJECT_ID"
        fi
      fi

      # Type-specific checks
      REC_TYPE=$(echo "$FM" | grep -E '^[[:space:]]*type:' | head -n 1 | sed -E 's/^[[:space:]]*type:[[:space:]]*//; s/["'\'']//g')
      case "$REC_TYPE" in
        ticket)
          for tf in lane size title req_links; do
            if ! echo "$FM" | grep -q -E "^[[:space:]]*$tf:"; then
              log_error "$file" "ticket missing type-specific field: $tf"
            fi
          done
          ;;
        manifest)
          for mf in ticket_id allowed_to_modify edit_budget; do
            if ! echo "$FM" | grep -q -E "^[[:space:]]*$mf:"; then
              log_error "$file" "manifest missing type-specific field: $mf"
            fi
          done
          ;;
        verification)
          for vf in ticket_id method result; do
            if ! echo "$FM" | grep -q -E "^[[:space:]]*$vf:"; then
              log_error "$file" "verification missing type-specific field: $vf"
            fi
          done
          ;;
        approval)
          for af in role verbatim_quote; do
            if ! echo "$FM" | grep -q -E "^[[:space:]]*$af:"; then
              log_error "$file" "approval missing type-specific field: $af"
            fi
          done
          ;;
      esac
    done
  done
  log_note "scanned $SCANNED records for frontmatter"
}

# ---------------------------------------------------------------- 2. Secrets Scan
check_secrets() {
  log_note "scanning records for secrets..."
  RECORD_DIRS="tickets questions decisions manifests baselines verifications approvals claims blockers reviews requirements glossary risks lessons environment waivers evidence events"

  for dir in $RECORD_DIRS; do
    SUBDIR="$AF_DIR/$dir"
    if [ ! -d "$SUBDIR" ]; then
      continue
    fi

    # Check for secret patterns
    # API tokens (sk-, ghp_, gho_, xoxb-, xoxp-, glpat-)
    MATCHES=$(grep -E -n -i '([[:<:]]|[^a-zA-Z0-9])(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{30,}|gho_[a-zA-Z0-9]{30,}|xox[baprs]-[a-zA-Z0-9-]{20,}|glpat-[a-zA-Z0-9-]{20,})' "$SUBDIR"/* 2>/dev/null)
    if [ -n "$MATCHES" ]; then
      echo "$MATCHES" | while IFS= read -r line; do
        log_error "$line" "possible API token in record — rotate and purge"
      done
    fi

    # AWS keys
    MATCHES=$(grep -E -n 'AKIA[0-9A-Z]{16}' "$SUBDIR"/* 2>/dev/null)
    if [ -n "$MATCHES" ]; then
      echo "$MATCHES" | while IFS= read -r line; do
        log_error "$line" "AWS access key in record"
      done
    fi

    # Private key blocks
    MATCHES=$(grep -E -n 'BEGIN [A-Z ]*PRIVATE KEY' "$SUBDIR"/* 2>/dev/null)
    if [ -n "$MATCHES" ]; then
      echo "$MATCHES" | while IFS= read -r line; do
        log_error "$line" "private key block in record"
      done
    fi

    # Database URLs with password
    MATCHES=$(grep -E -n -i '(postgres|postgresql|mysql|mongodb|redis)://[^:]+:[^@]+@' "$SUBDIR"/* 2>/dev/null)
    if [ -n "$MATCHES" ]; then
      echo "$MATCHES" | while IFS= read -r line; do
        log_error "$line" "database credentials URL in record"
      done
    fi
  done
}

# ---------------------------------------------------------------- 3. Manifest vs Changed Files
check_manifest() {
  log_note "checking manifest compliance..."

  # Active manifest overlap detection
  MDIR="$AF_DIR/manifests"
  if [ -d "$MDIR" ]; then
    MANIFEST_FILES=$(find "$MDIR" -name "*.md" 2>/dev/null)
    if [ -n "$MANIFEST_FILES" ]; then
      # Scan allowed_to_modify paths across active manifests
      CLAIMED_TMP="${AF_DIR}/.tmp_claims.$$"
      rm -f "$CLAIMED_TMP"
      for mf in $MANIFEST_FILES; do
        TID=$(grep -E '^[[:space:]]*ticket_id:' "$mf" | head -n1 | sed -E 's/^[[:space:]]*ticket_id:[[:space:]]*//; s/["'\'']//g')
        # Extract patterns under allowed_to_modify
        sed -n '/allowed_to_modify:/,/^[a-zA-Z0-9_-]*:/p' "$mf" | grep -E '^[[:space:]]*- ' | sed 's/^[[:space:]]*- //' | while IFS= read -r pat; do
          if [ -n "$pat" ]; then
            echo "$pat $TID" >> "$CLAIMED_TMP"
          fi
        done
      done
      if [ -f "$CLAIMED_TMP" ]; then
        DUPS=$(awk '{print $1}' "$CLAIMED_TMP" | sort | uniq -d)
        for dup in $DUPS; do
          TICKETS=$(grep "^$dup " "$CLAIMED_TMP" | awk '{print $2}' | tr '\n' ' ')
          log_error "$MDIR" "manifest overlap: pattern $dup claimed by multiple active tickets: $TICKETS (§S5.2)"
        done
        rm -f "$CLAIMED_TMP"
      fi
    fi
  fi

  # Git changed files check
  if command -v git >/dev/null 2>&1; then
    CHANGED=$(git -C "$ROOT_DIR" diff --name-only HEAD 2>/dev/null || git -C "$ROOT_DIR" status --porcelain 2>/dev/null | awk '{print $2}')
    if [ -n "$CHANGED" ]; then
      STATE_FILE="$AF_DIR/STATE.md"
      ACTIVE_MANIFEST=""
      if [ -f "$STATE_FILE" ]; then
        ACTIVE_MANIFEST=$(grep -E '^[[:space:]]*active_manifest:' "$STATE_FILE" | head -n1 | sed -E 's/^[[:space:]]*active_manifest:[[:space:]]*//; s/["'\'']//g')
      fi

      if [ "$ACTIVE_MANIFEST" = "none" ] || [ -z "$ACTIVE_MANIFEST" ]; then
        for f in $CHANGED; do
          case "$f" in
            .agentflow/*) ;;
            *) log_error "$f" "file modified off manifest: no active manifest in STATE.md (§S5.1)" ;;
          esac
        done
      fi
    fi
  fi
}

# ---------------------------------------------------------------- 4. Gates
check_gates() {
  log_note "checking gate criteria..."
  TICKETS_DIR="$AF_DIR/tickets"
  EVENTS_DIR="$AF_DIR/events"
  VERIFS_DIR="$AF_DIR/verifications"

  if [ -d "$EVENTS_DIR" ] && [ -d "$TICKETS_DIR" ]; then
    DONE_EVENTS=$(find "$EVENTS_DIR" -name "*ticket-done*.md" -o -name "*status-change*done*.md" 2>/dev/null)
    for dev in $DONE_EVENTS; do
      TID=$(grep -E '^[[:space:]]*ticket_id:' "$dev" | head -n1 | sed -E 's/^[[:space:]]*ticket_id:[[:space:]]*//; s/["'\'']//g')
      if [ -z "$TID" ] || [ "$TID" = "none" ]; then
        TID=$(basename "$dev" | sed -E 's/^[0-9T]+Z-([A-Za-z0-9-]+)-.*/\1/')
      fi
      if [ -n "$TID" ] && [ "$TID" != "none" ]; then
        # Check if passing verification exists
        PASSING_V=""
        if [ -d "$VERIFS_DIR" ]; then
          PASSING_V=$(grep -l -E '^[[:space:]]*result:[[:space:]]*pass' "$VERIFS_DIR"/* 2>/dev/null | xargs grep -l -E "^[[:space:]]*ticket_id:[[:space:]]*$TID" 2>/dev/null)
        fi
        if [ -z "$PASSING_V" ]; then
          log_error "$TICKETS_DIR/$TID.md" "gate failure: ticket is done but has no passing verification record (§S6)"
        fi
      fi
    done
  fi

  # Claims with label: verified must have evidence_ref
  CLAIMS_DIR="$AF_DIR/claims"
  if [ -d "$CLAIMS_DIR" ]; then
    for cf in "$CLAIMS_DIR"/*.md; do
      if [ -f "$cf" ]; then
        if grep -q -E '^[[:space:]]*label:[[:space:]]*verified' "$cf"; then
          EV_REF=$(grep -E '^[[:space:]]*evidence_ref:' "$cf" | head -n1 | sed -E 's/^[[:space:]]*evidence_ref:[[:space:]]*//; s/["'\'']//g')
          if [ -z "$EV_REF" ] || [ "$EV_REF" = "none" ] || [ "$EV_REF" = "n/a" ]; then
            log_error "$cf" "claim is labeled 'verified' but has no evidence_ref (§S6.1)"
          fi
        fi
      fi
    done
  fi

  # Freshness of STATE.md
  STATE_FILE="$AF_DIR/STATE.md"
  if [ -f "$STATE_FILE" ]; then
    BUILT_FROM=$(grep -E '^[[:space:]]*built_from:' "$STATE_FILE" | head -n1 | sed -E 's/^[[:space:]]*built_from:[[:space:]]*//; s/["'\'']//g')
    if [ -d "$EVENTS_DIR" ]; then
      LATEST_EVENT=$(ls "$EVENTS_DIR"/*.md 2>/dev/null | sort | tail -n1 | xargs basename 2>/dev/null | sed 's/\.md$//')
      if [ -n "$LATEST_EVENT" ] && [ "$BUILT_FROM" != "$LATEST_EVENT" ]; then
        log_warn "$STATE_FILE" "STATE.md is stale (built_from=$BUILT_FROM, newest event=$LATEST_EVENT) — run /af-rebuild"
      fi
    fi
  else
    log_error "$AF_DIR" "STATE.md missing — run /af-rebuild"
  fi
}

# ---------------------------------------------------------------- Dispatch
case "$CHECK" in
  all)
    check_frontmatter
    check_secrets
    check_manifest
    check_gates
    ;;
  frontmatter)
    check_frontmatter
    ;;
  secrets)
    check_secrets
    ;;
  manifest)
    check_manifest
    ;;
  gates)
    check_gates
    ;;
  *)
    log_error "$TARGET" "unknown check: $CHECK (allowed: all, frontmatter, secrets, manifest, gates)"
    ;;
esac

# ---------------------------------------------------------------- Result
if [ "$ERRORS" -gt 0 ]; then
  echo "result: FAIL (exit 1)"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo "result: PASS with warnings (exit 0)"
  exit 0
else
  echo "result: PASS (exit 0)"
  exit 0
fi
