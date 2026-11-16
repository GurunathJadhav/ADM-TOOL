#!/usr/bin/env python3
"""Agentflow Tier-1 validator — single-file, zero-dependency (Python 3.8+).

Checks a project's `.agentflow/` state against the framework format spec:
front matter presence and required fields, allowed enum values, project_id consistency,
ID and timestamp formats, gate checks (done without evidence, claims without evidence),
STATE.md freshness, secrets scan in records, policy file checksums and approvals,
manifest compliance and overlap detection, protected path violations, test file changes,
approval traceability and countersigns, and coverage (orphan tickets/requirements).

CLI:
    python validate.py [path-to-.agentflow] [--check=all|frontmatter|gates|manifest|secrets|policy|coverage]
    python validate.py [project-root] [--check=...] [--json] [--rebuild] [--seal] [--selfcheck] [--staged]

Exit codes: 0 = pass, 1 = failure (errors found).
"""

import argparse
import fnmatch
import hashlib
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone

# ---------------------------------------------------------------- constants

REQUIRED_COMMON = ["type", "id", "project_id", "schema_version", "created", "actor", "role"]

TYPE_DIRS = {
    "ticket": "tickets",
    "question": "questions",
    "decision": "decisions",
    "manifest": "manifests",
    "baseline": "baselines",
    "verification": "verifications",
    "approval": "approvals",
    "claim": "claims",
    "blocker": "blockers",
    "review": "reviews",
    "requirement": "requirements",
    "glossary": "glossary",
    "risk": "risks",
    "lesson": "lessons",
    "environment": "environment",
    "waiver": "waivers",
    "evidence": "evidence",
    "event": "events",
}

TYPE_REQUIRED = {
    "ticket": ["lane", "size", "title", "req_links"],
    "question": ["category", "blocking"],
    "decision": ["title", "decision_type", "status"],
    "manifest": ["ticket_id", "allowed_to_modify", "edit_budget"],
    "baseline": ["ticket_id"],
    "verification": ["ticket_id", "method", "result"],
    "approval": ["role", "verbatim_quote"],
    "claim": ["statement", "label"],
    "blocker": ["blocker_type", "owner"],
    "review": ["ticket_id", "reviewer_type", "verdict"],
    "requirement": ["priority", "status"],
    "glossary": ["term"],
    "risk": ["title", "likelihood", "impact"],
    "lesson": ["title", "category"],
    "environment": ["fact_name", "value", "label"],
    "waiver": ["rule", "reason", "role", "expires"],
    "evidence": ["ticket_id"],
    "event": ["event_type", "summary"],
}

ALLOWED_ENUMS = {
    "lane": {"trivial", "standard", "incident", "project-level"},
    "priority": {"must", "should", "could", "wont", "may"},
    "moscow": {"must", "should", "could", "wont"},
    "size": {"s", "m", "l"},
    "ticket_type": {"story", "task", "spike", "bug", "change"},
    "decision_type": {"one-way", "two-way"},
    "label": {"verified", "inferred", "unknown"},
    "blocker_type": {"human", "technical"},
    "verdict": {"approved", "changes-requested"},
    "reviewer_type": {"agent", "human", "fresh-session"},
    "method": {
        "automated-test", "command-output", "manual-check", "screenshot/visual",
        "screenshot-visual", "static-check", "document-review", "user-confirmation",
        "test", "lint", "typecheck", "manual", "audit"
    },
    "result": {"pass", "fail", "waived", "unverified"},
    "likelihood": {"low", "medium", "high"},
    "impact": {"low", "medium", "high"},
}

REQ_STATUS = {"proposed", "baselined", "in-progress", "delivered", "descoped", "dropped", "active", "deferred", "deprecated"}

TICKET_STATUSES = {"backlog", "ready", "in-progress", "in-review", "done", "blocked",
                   "deferred", "cancelled", "superseded", "reopened"}

TS_RE = re.compile(r"^\d{8}T\d{6}Z$")
ID_RE = re.compile(r"^[A-Z]{1,5}-[0-9a-km-np-tv-z]{4}-[a-z0-9-]{1,50}$")

EVENT_TYPES = [
    "ticket-created", "ticket-ready", "ticket-claimed", "ticket-started",
    "ticket-in-review", "ticket-done", "ticket-blocked", "ticket-reopened",
    "ticket-cancelled", "ticket-superseded", "ticket-deferred", "ticket-lane-change",
    "record-created", "status-change", "approval-granted", "manifest-approved",
    "verification-pass", "verification-fail", "diff-checked", "review-completed",
    "phase-advance", "blocker-raised", "blocker-cleared", "waiver-granted",
    "rule-change", "pause", "resume", "correction", "external-change"
]

SECRET_PATTERNS = [
    (re.compile(r"(?i)\b(sk-[a-zA-Z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|gho_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|glpat-[A-Za-z0-9-]{20,})\b"), "API token literal"),
    (re.compile(r"(?i)\b(AKIA[0-9A-Z]{16})\b"), "AWS access key id"),
    (re.compile(r"(?i)\b(aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40})\b"), "AWS secret access key"),
    (re.compile(r"(?i)\b[0-9a-f]{32}\b[^\n]{0,40}\bdatadog\b"), "Datadog key"),
    (re.compile(r"(?i)(password|passwd|secret|api[_-]?key|auth_token)\s*[:=]\s*['\"][^'\"]{8,}['\"]"), "credential assignment"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "private key block"),
    (re.compile(r"(?i)\b(postgres|postgresql|mysql|mongodb|redis)://[^:\s]+:[^@\s]+@"), "database URL with credentials"),
    (re.compile(r"(?i)Bearer\s+[A-Za-z0-9_\-\.]{25,}"), "Bearer authentication token"),
]

DEFAULT_PROTECTED_PATTERNS = [
    ".env", ".env.*", ".env*", "secrets/*", "private/*",
    "*.pem", "*.key", "*.p12", "*.pfx",
    ".agentflow/project.md", ".agentflow/gates.md", ".agentflow/lanes.md",
    ".agentflow/safety.md", ".agentflow/protected.md", ".agentflow/workflow-map.md",
    "AGENTS.md", "CLAUDE.md", ".cursor/rules/*",
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "pnpm-lock.*",
    "Gemfile", "Gemfile.lock", "Pipfile", "Pipfile.lock", "pyproject.toml", "poetry.lock",
    "requirements.txt", "go.mod", "go.sum", "Cargo.toml", "Cargo.lock", "composer.json", "composer.lock",
    "Dockerfile", "*.dockerfile", "docker-compose*.yml", "docker-compose*.yaml",
    ".github/*", ".github/workflows/*", ".gitlab-ci.yml", "Jenkinsfile", ".circleci/*",
    "deploy/*", "infra/*", "infrastructure/*", "terraform/*", "*.tf", "k8s/*", "helm/*",
    "migrations/*", "db/migrate/*", "alembic/*", "prisma/migrations/*",
    "LICENSE", "LICENSE*", "LICENCE", "LICENCE*",
    "jest.config.*", "vitest.config.*", "pytest.ini", ".coveragerc"
]

DERIVED_VIEWS = {
    "requirements.md": ("requirements", lambda recs: build_index(recs, "requirement",
                            lambda r: "%s — %s [%s]" % (r["id"], r.get("title", r.get("term", "")), r.get("status", "?")))),
    "glossary.md": ("glossary", lambda recs: build_index(recs, "glossary",
                        lambda r: "%s — %s" % (r.get("term", r["id"]), r.get("definition", "")))),
    "risks.md": ("risks", lambda recs: build_index(recs, "risk",
                     lambda r: "%s — %s (L:%s I:%s)" % (r["id"], r.get("title", ""), r.get("likelihood", "?"), r.get("impact", "?")))),
    "lessons.md": ("lessons", lambda recs: build_index(recs, "lesson",
                       lambda r: "%s — %s [%s]" % (r["created"], r.get("title", ""), r.get("category", "?")))),
    "APPROVALS-NEEDED.md": ("approvals", None),
}

# ---------------------------------------------------------------- helpers

def now_compact():
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def parse_front_matter(path):
    """Return (meta dict, body string, error string or None)."""
    try:
        with open(path, "r", encoding="utf-8-sig") as fh:
            text = fh.read()
    except OSError as exc:
        return {}, "", "unreadable: %s" % exc
    return parse_front_matter_content(text)


def parse_front_matter_content(text):
    text = text.replace("\r\n", "\n")
    if not text.startswith("---"):
        return {}, text, "no front-matter block (must start with ---)"
    end = text.find("\n---", 3)
    if end == -1:
        return {}, text, "front-matter block never closes"
    meta_text = text[3:end].lstrip("\n")
    body = text[end + 4:].lstrip("\n")
    meta, current_key = {}, None
    for raw in meta_text.splitlines():
        line = raw.rstrip()
        if not line or line.startswith("#"):
            continue
        if line.startswith(("  ", "\t")) and current_key:
            sub = line.strip()
            if sub.startswith("- "):
                meta[current_key].append(sub[2:].strip("\"'"))
            else:
                if isinstance(meta[current_key], list):
                    meta[current_key].append(sub.strip("\"'"))
                else:
                    meta[current_key] = [sub.strip("\"'")]
            continue
        m = re.match(r"^([A-Za-z0-9_-]+)\s*:\s*(.*)$", line)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip()
        if val in ("", "|", ">"):
            meta[key] = []
            current_key = key
        elif val.startswith("[") and val.endswith("]"):
            items = [x.strip().strip("\"'") for x in val[1:-1].split(",") if x.strip()]
            meta[key] = items
            current_key = None
        else:
            meta[key] = val.strip("\"'")
            current_key = None
    return meta, body, None


def is_list(meta, key):
    return isinstance(meta.get(key), list)


class Report:
    def __init__(self, root):
        self.root = root
        self.errors, self.warnings, self.notes = [], [], []

    def error(self, path, msg):
        rel = os.path.relpath(path, self.root) if os.path.exists(path) else path
        self.errors.append("%s: %s" % (rel, msg))

    def warn(self, path, msg):
        rel = os.path.relpath(path, self.root) if os.path.exists(path) else path
        self.warnings.append("%s: %s" % (rel, msg))

    def note(self, msg):
        self.notes.append(msg)

    @property
    def ok(self):
        return len(self.errors) == 0

    @property
    def exit_code(self):
        return 0 if not self.errors else 1


def resolve_paths(target_path):
    """Resolves project root and .agentflow directory from user input."""
    target = os.path.abspath(target_path or ".")
    if os.path.basename(target) == ".agentflow" and os.path.isdir(target):
        af_dir = target
        root = os.path.dirname(target)
    elif os.path.isdir(os.path.join(target, ".agentflow")):
        af_dir = os.path.join(target, ".agentflow")
        root = target
    elif os.path.exists(os.path.join(target, "project.md")) and os.path.isdir(os.path.join(target, "events")):
        af_dir = target
        root = os.path.dirname(target)
    else:
        af_dir = os.path.join(target, ".agentflow")
        root = target
    return root, af_dir


# ---------------------------------------------------------------- checks

def check_record_file(rep, path, project_id):
    meta, _, err = parse_front_matter(path)
    if err:
        rep.error(path, err)
        return None
    rtype = meta.get("type")
    rid = meta.get("id")
    if not rtype or rtype not in TYPE_DIRS:
        rep.error(path, "unknown or missing type: %r" % rtype)
        return meta

    # required common fields
    for field in REQUIRED_COMMON:
        if field not in meta or (is_list(meta, field) and not meta[field]):
            rep.error(path, "missing required field: %s" % field)

    # id format
    if rid and not ID_RE.match(str(rid)):
        rep.error(path, "id %r does not match <Prefix>-<4 base32>-<slug>" % rid)

    # project_id consistency
    if project_id and meta.get("project_id") and meta["project_id"] != project_id:
        rep.error(path, "project_id mismatch: %r != project %r" % (meta["project_id"], project_id))

    # created timestamp
    created = meta.get("created", "")
    if created == "unknown":
        rep.warn(path, "created: unknown — flagged until real clock backfills it")
    elif created and not TS_RE.match(str(created)):
        rep.error(path, "created is not compact UTC (YYYYMMDDTHHMMSSZ): %r" % created)

    # type-specific required fields
    for field in TYPE_REQUIRED.get(rtype, []):
        if field not in meta or (is_list(meta, field) and not meta[field]):
            rep.error(path, "missing type-specific field for %s: %s" % (rtype, field))

    # allowed enum values
    for field, allowed in ALLOWED_ENUMS.items():
        if field in meta and not is_list(meta, field):
            val = str(meta[field]).lower()
            if val not in allowed:
                rep.error(path, "%s value %r not in allowed set (%s)" % (field, meta[field], ", ".join(sorted(allowed))))

    # requirement status
    if rtype == "requirement" and "status" in meta and not is_list(meta, "status"):
        if str(meta["status"]).lower() not in REQ_STATUS:
            rep.error(path, "requirement status %r not allowed" % meta["status"])

    return meta


def check_secrets(rep, path):
    try:
        with open(path, "r", encoding="utf-8-sig", errors="replace") as fh:
            text = fh.read()
    except OSError:
        return
    for pattern, name in SECRET_PATTERNS:
        m = pattern.search(text)
        if m:
            rep.error(path, "possible secret in record (%s) — rotate and purge, see secrets-and-redaction skill" % name)


def latest_ticket_status(af_dir):
    """Derive ticket status from event filenames or contents."""
    statuses = {}
    events_dir = os.path.join(af_dir, "events")
    if not os.path.isdir(events_dir):
        return statuses
    for name in sorted(os.listdir(events_dir)):
        if not name.endswith(".md"):
            continue
        m = re.match(r"^(\d{8}T\d{6}Z|ts-unknown)-([A-Za-z0-9-]+?)-(ticket-[a-z-]+|status-change|done|pass|fail)-(.+)\.md$", name)
        if m:
            ticket = m.group(2)
            event_type = m.group(3)
            if ticket and ticket != "none":
                st = event_type.replace("ticket-", "")
                statuses[ticket] = st
                continue
        # Check event content if filename pattern isn't conclusive
        path = os.path.join(events_dir, name)
        meta, _, _ = parse_front_matter(path)
        tid = meta.get("ticket_id") or meta.get("target_id")
        etype = meta.get("event_type", "")
        if tid and tid != "none" and etype:
            st = etype.replace("ticket-", "")
            statuses[tid] = st
    return statuses


def check_done_evidence(rep, af_dir, ticket_status):
    """A ticket marked done must have a passing verification record and an evidence ref."""
    verifs = {}
    vdir = os.path.join(af_dir, "verifications")
    if os.path.isdir(vdir):
        for name in os.listdir(vdir):
            if not name.endswith(".md"):
                continue
            path = os.path.join(vdir, name)
            meta, _, err = parse_front_matter(path)
            if err is None and meta.get("result") == "pass":
                tid = str(meta.get("ticket_id"))
                ev_ref = meta.get("evidence_ref")
                verifs[tid] = (path, ev_ref)

    reviews = set()
    rdir = os.path.join(af_dir, "reviews")
    if os.path.isdir(rdir):
        for name in os.listdir(rdir):
            if not name.endswith(".md"):
                continue
            meta, _, err = parse_front_matter(os.path.join(rdir, name))
            if err is None:
                reviews.add(str(meta.get("ticket_id")))

    for ticket, status in ticket_status.items():
        if status != "done":
            continue
        tpath = os.path.join(af_dir, "tickets", "%s.md" % ticket)
        lane = "standard"
        if os.path.exists(tpath):
            meta, _, _ = parse_front_matter(tpath)
            lane = str(meta.get("lane", "standard")).lower()
        if ticket not in verifs:
            rep.error(tpath, "gate failure: ticket is marked 'done' but has no passing verification record")
        else:
            vpath, ev_ref = verifs[ticket]
            if not ev_ref or ev_ref in ("none", "n/a", ""):
                rep.error(vpath, "verification record for ticket %s has no evidence_ref" % ticket)

        if lane == "standard" and ticket not in reviews:
            rep.error(tpath, "gate failure: standard lane ticket is 'done' without an independent review record")


def check_claims_evidence(rep, af_dir):
    """Every claim with label 'verified' must have an evidence_ref."""
    cdir = os.path.join(af_dir, "claims")
    if not os.path.isdir(cdir):
        return
    for name in sorted(os.listdir(cdir)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(cdir, name)
        meta, _, err = parse_front_matter(path)
        if err or meta.get("type") != "claim":
            continue
        label = str(meta.get("label", "")).lower()
        if label == "verified":
            ev_ref = meta.get("evidence_ref")
            if not ev_ref or str(ev_ref).lower() in ("none", "n/a", ""):
                rep.error(path, "claim %s is labeled 'verified' but has no evidence_ref" % meta.get("id", name))
            elif isinstance(ev_ref, str) and ev_ref.startswith(("evidence/", ".agentflow/evidence/")):
                ev_path = os.path.join(af_dir, ev_ref.replace(".agentflow/", ""))
                if not os.path.exists(ev_path):
                    rep.warn(path, "referenced evidence file does not exist: %s" % ev_ref)


def check_state_freshness(rep, af_dir):
    state_path = os.path.join(af_dir, "STATE.md")
    if not os.path.exists(state_path):
        rep.error(state_path, "STATE.md missing — run /af-rebuild")
        return
    try:
        with open(state_path, "r", encoding="utf-8-sig", errors="replace") as fh:
            text = fh.read()
    except OSError as exc:
        rep.error(state_path, "cannot read STATE.md: %s" % exc)
        return

    m = re.search(r"built_from:\s*([A-Za-z0-9-_.]+)", text)
    newest_event = None
    events_dir = os.path.join(af_dir, "events")
    if os.path.isdir(events_dir):
        names = sorted(n for n in os.listdir(events_dir) if n.endswith(".md"))
        if names:
            newest_event = os.path.splitext(names[-1])[0]

    if newest_event and (not m or m.group(1) != newest_event):
        rep.warn(state_path, "STATE.md is stale (built_from=%s, newest event=%s) — run /af-rebuild"
                 % (m.group(1) if m else "?", newest_event))
    for invariant_hint in ("edit lock", "next action"):
        if invariant_hint not in text.lower():
            rep.warn(state_path, "STATE.md missing expected invariant/section: %s" % invariant_hint)


def check_manifest_overlaps(rep, af_dir):
    """Active manifests must not overlap on the same file."""
    mdir = os.path.join(af_dir, "manifests")
    if not os.path.isdir(mdir):
        return
    ticket_status = latest_ticket_status(af_dir)
    claims = {}
    for name in sorted(os.listdir(mdir)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(mdir, name)
        meta, _, err = parse_front_matter(path)
        if err or meta.get("type") != "manifest":
            continue
        ticket = str(meta.get("ticket_id", name[:-3]))
        if ticket_status.get(ticket) in ("done", "cancelled", "superseded", "deferred"):
            continue
        for field in ("allowed_to_modify", "allowed_to_create"):
            vals = meta.get(field)
            if isinstance(vals, list):
                for pattern in vals:
                    claims.setdefault(pattern, []).append(ticket)
            elif vals:
                claims.setdefault(str(vals), []).append(ticket)
    for pattern, tickets in sorted(claims.items()):
        if len(tickets) > 1:
            rep.error(mdir, "manifest overlap: %r claimed by multiple active tickets: %s (§S5.2)" % (pattern, ", ".join(tickets)))


def get_git_changed_files(root, staged_only=False):
    """Retrieve changed files from git if repository exists."""
    cmd = ["git", "diff", "--name-only"]
    if staged_only:
        cmd.append("--cached")
    else:
        cmd.append("HEAD")
    try:
        res = subprocess.run(cmd, cwd=root, capture_output=True, text=True, timeout=10)
        if res.returncode == 0:
            return [line.strip().replace("\\", "/") for line in res.stdout.splitlines() if line.strip()]
        # Fallback to status --porcelain
        res2 = subprocess.run(["git", "status", "--porcelain"], cwd=root, capture_output=True, text=True, timeout=10)
        if res2.returncode == 0:
            files = []
            for line in res2.stdout.splitlines():
                parts = line.strip().split(maxsplit=1)
                if len(parts) == 2:
                    files.append(parts[1].replace("\\", "/"))
            return files
    except Exception:
        pass
    return None


def match_pattern(filepath, pattern):
    filepath = filepath.replace("\\", "/")
    pattern = pattern.replace("\\", "/")
    if pattern.endswith("/*"):
        prefix = pattern[:-2]
        return filepath.startswith(prefix + "/")
    if pattern.endswith("/"):
        return filepath.startswith(pattern)
    return fnmatch.fnmatch(filepath, pattern) or fnmatch.fnmatch(os.path.basename(filepath), pattern)


def check_manifest_compliance(rep, root, af_dir, staged_only=False):
    """Check git changed files against the active manifest."""
    changed_files = get_git_changed_files(root, staged_only=staged_only)
    if changed_files is None:
        rep.note("git not detected or clean repository — skipping git diff manifest check")
        return

    # Filter out .agentflow/ metadata records
    code_changes = [f for f in changed_files if not f.startswith(".agentflow/")]
    if not code_changes:
        return

    # Find active ticket and its manifest
    state_path = os.path.join(af_dir, "STATE.md")
    active_manifest_path = None
    if os.path.exists(state_path):
        meta, body, _ = parse_front_matter(state_path)
        m = re.search(r"active_manifest:\s*([^\s\r\n]+)", body)
        if m and m.group(1).lower() != "none":
            active_manifest_path = os.path.join(af_dir, m.group(1).replace(".agentflow/", ""))

    allowed_patterns = set()
    test_patterns = set()
    if active_manifest_path and os.path.exists(active_manifest_path):
        mmeta, _, _ = parse_front_matter(active_manifest_path)
        for field in ("allowed_to_modify", "allowed_to_create"):
            val = mmeta.get(field)
            if isinstance(val, list):
                allowed_patterns.update(val)
            elif val:
                allowed_patterns.add(str(val))

    for changed in code_changes:
        matched = False
        for pat in allowed_patterns:
            if match_pattern(changed, pat):
                matched = True
                break
        if not matched:
            rep.error(changed, "file modified off manifest: %s (no active manifest allows this path)" % changed)

        # Test file change check
        is_test_file = any(t in changed.lower() for t in ("test", "spec")) or changed.endswith(("_test.go", "test_*.py", ".test.js", ".spec.ts"))
        if is_test_file and not matched:
            rep.error(changed, "test file change without manifest entry or criterion link (§S6.3)")


def check_protected_paths(rep, root, af_dir, staged_only=False):
    """Check changed files against protected paths and verify approvals."""
    protected_file = os.path.join(af_dir, "protected.md")
    patterns = list(DEFAULT_PROTECTED_PATTERNS)
    if os.path.exists(protected_file):
        try:
            with open(protected_file, "r", encoding="utf-8-sig", errors="replace") as fh:
                for line in fh:
                    if line.strip().startswith("|") and not line.strip().startswith("|---"):
                        cols = [c.strip() for c in line.strip().split("|")[1:-1]]
                        if cols and cols[0] and not cols[0].startswith("Path"):
                            patterns.append(cols[0].strip("`"))
        except OSError:
            pass

    changed_files = get_git_changed_files(root, staged_only=staged_only)
    if not changed_files:
        return

    # Approvals scan
    approvals_text = ""
    app_dir = os.path.join(af_dir, "approvals")
    if os.path.isdir(app_dir):
        for name in os.listdir(app_dir):
            if name.endswith(".md"):
                try:
                    with open(os.path.join(app_dir, name), "r", encoding="utf-8-sig", errors="replace") as fh:
                        approvals_text += "\n" + fh.read()
                except OSError:
                    pass

    for changed in changed_files:
        is_protected = False
        for pat in patterns:
            if match_pattern(changed, pat):
                is_protected = True
                break
        if is_protected:
            # Must have approval
            if changed not in approvals_text and os.path.basename(changed) not in approvals_text:
                rep.error(changed, "protected path modified without approval record: %s (§S5.6)" % changed)


def check_policy_checksums(rep, af_dir):
    """Check policy files against baselines/policy-seal.md."""
    policies = ["project.md", "gates.md", "lanes.md", "safety.md", "protected.md", "workflow-map.md"]
    for pol in policies:
        p = os.path.join(af_dir, pol)
        if not os.path.exists(p):
            rep.error(af_dir, "required policy file missing: %s" % pol)

    seal_file = os.path.join(af_dir, "baselines", "policy-seal.md")
    if os.path.exists(seal_file):
        try:
            with open(seal_file, "r", encoding="utf-8-sig", errors="replace") as fh:
                content = fh.read()
            for line in content.splitlines():
                m = re.match(r"^-\s*([A-Za-z0-9_-]+\.md)\s*:\s*sha256:([0-9a-fA-F]{64})", line.strip())
                if m:
                    pol_name = m.group(1)
                    expected_hash = m.group(2).lower()
                    target_path = os.path.join(af_dir, pol_name)
                    if os.path.exists(target_path):
                        with open(target_path, "rb") as pf:
                            actual_hash = hashlib.sha256(pf.read()).hexdigest().lower()
                        if actual_hash != expected_hash:
                            rep.error(target_path, "policy file hash mismatch! Modified without approved rule-change")
        except Exception as exc:
            rep.warn(seal_file, "failed to parse policy seal: %s" % exc)


def check_approval_traceability(rep, af_dir):
    """Verify approval records exist for manifests and high-risk changes."""
    app_dir = os.path.join(af_dir, "approvals")
    approvals = {}
    if os.path.isdir(app_dir):
        for name in os.listdir(app_dir):
            if not name.endswith(".md"):
                continue
            path = os.path.join(app_dir, name)
            meta, _, err = parse_front_matter(path)
            if not err and meta.get("id"):
                approvals[meta["id"]] = meta
                target = meta.get("target_record") or meta.get("approves_id")
                if target:
                    approvals[target] = meta

    # Check high-risk approvals have countersign
    for aid, ameta in approvals.items():
        if isinstance(ameta, dict) and str(ameta.get("high_risk", "")).lower() in ("yes", "true"):
            cm = ameta.get("countersign_method")
            if not cm or str(cm).lower() in ("n/a", "none", ""):
                rep.error(os.path.join(app_dir, "%s.md" % ameta.get("id", aid)),
                          "high-risk approval lacks required countersign (§S2.2)")

    # Check active manifests have approval
    mdir = os.path.join(af_dir, "manifests")
    if os.path.isdir(mdir):
        ticket_status = latest_ticket_status(af_dir)
        for name in os.listdir(mdir):
            if not name.endswith(".md"):
                continue
            path = os.path.join(mdir, name)
            meta, _, _ = parse_front_matter(path)
            tid = meta.get("ticket_id", "")
            if ticket_status.get(tid) in ("in-progress", "in-review", "done"):
                app_ref = meta.get("approval_ref")
                mid = meta.get("id", name[:-3])
                if not app_ref and mid not in approvals and tid not in approvals:
                    rep.error(path, "manifest for active ticket %s has no linked approval record" % tid)


def check_coverage(rep, af_dir):
    """Every requirement maps to >=1 ticket; every ticket maps to a requirement."""
    req_ids, ticket_reqs = set(), {}
    rdir = os.path.join(af_dir, "requirements")
    if os.path.isdir(rdir):
        for name in os.listdir(rdir):
            if not name.endswith(".md"):
                continue
            path = os.path.join(rdir, name)
            meta, _, _ = parse_front_matter(path)
            if str(meta.get("status", "")).lower() in ("delivered", "descoped", "dropped", "deprecated"):
                continue
            if meta.get("id"):
                req_ids.add(str(meta["id"]))

    tdir = os.path.join(af_dir, "tickets")
    if os.path.isdir(tdir):
        for name in os.listdir(tdir):
            if not name.endswith(".md"):
                continue
            path = os.path.join(tdir, name)
            meta, _, _ = parse_front_matter(path)
            links = meta.get("req_links")
            if isinstance(links, list):
                ticket_reqs[name] = [str(x) for x in links]
            elif links:
                ticket_reqs[name] = [str(links)]

    covered = set()
    for tname, reqs in ticket_reqs.items():
        if not reqs:
            rep.error(os.path.join(tdir, tname), "orphan ticket: ticket has no req_links (§S3)")
        for r in reqs:
            if r and r != "none":
                covered.add(r)
    for r in sorted(req_ids - covered):
        rep.error(os.path.join(af_dir, "requirements"), "orphan requirement: %s maps to no ticket (§S3)" % r)


def check_assumptions(rep, af_dir):
    qdir = os.path.join(af_dir, "questions")
    if not os.path.isdir(qdir):
        return
    events_dir = os.path.join(af_dir, "events")
    event_names = sorted(os.listdir(events_dir)) if os.path.isdir(events_dir) else []
    # A blocking question counts as closed only when an event exists for its id whose
    # filename carries a resolving token. Event-type tokens vary by project convention
    # (question-answered, status-change, ...), so we match a family of tokens.
    resolve_tokens = ("answered", "confirmed", "assumed", "deferred", "closed", "status-change")
    for name in sorted(os.listdir(qdir)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(qdir, name)
        meta, _, _ = parse_front_matter(path)
        if str(meta.get("blocking", "")).lower() == "true":
            qid = meta.get("id", name[:-3])
            resolved = any(qid.lower() in ev.lower() and any(tok in ev for tok in resolve_tokens)
                           for ev in event_names)
            if not resolved:
                rep.warn(path, "blocking question %s appears open — discovery gate cannot close while open" % qid)


# ---------------------------------------------------------------- rebuild & seal

def build_index(recs, rtype, formatter):
    lines = []
    for path, meta in sorted(recs.items()):
        if meta and meta.get("type") == rtype:
            try:
                lines.append(formatter(meta))
            except Exception:
                lines.append("%s — (unformattable)" % meta.get("id", path))
    return lines


def rebuild_derived(rep, af_dir):
    recs = {}
    for sub in set(TYPE_DIRS.values()):
        sdir = os.path.join(af_dir, sub)
        if not os.path.isdir(sdir):
            continue
        for base, _, files in os.walk(sdir):
            for f in files:
                if not f.endswith(".md"):
                    continue
                p = os.path.join(base, f)
                meta, _, err = parse_front_matter(p)
                recs[p] = None if err else meta
    for fname, (source_dir, builder) in DERIVED_VIEWS.items():
        if builder is None:
            continue
        sub_recs = {p: m for p, m in recs.items() if source_dir in p.replace("\\", "/")}
        lines = builder(sub_recs)
        out = os.path.join(af_dir, fname)
        header = "# %s (derived index — disposable, rebuilt by /af-rebuild)\n\n" % fname[:-3]
        body = header + "\n".join("- " + l for l in lines) + ("\n" if lines else "_empty_\n")
        tmp = out + ".tmp"
        with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(body)
        os.replace(tmp, out)
        rep.note("rebuilt %s (%d entries)" % (fname, len(lines)))


def seal_hashes(rep, af_dir):
    """Write sha256 baseline hashes for policy files."""
    os.makedirs(os.path.join(af_dir, "baselines"), exist_ok=True)
    seals_path = os.path.join(af_dir, "baselines", "policy-seal.md")
    lines = ["---", "type: baseline", "id: B-0000-policy-seal", "project_id: tooling-seal",
             "schema_version: 1.0.0", "created: %s" % now_compact(), "actor: validator",
             "role: agent", "ticket_id: none", "tree_status: clean", "---", "",
             "# Policy file hash seal", "", "<!-- Tooling seal: hashes only, never project data. -->", ""]
    for pol in ["project.md", "gates.md", "lanes.md", "safety.md", "protected.md", "workflow-map.md"]:
        p = os.path.join(af_dir, pol)
        if os.path.exists(p):
            with open(p, "rb") as fh:
                digest = hashlib.sha256(fh.read()).hexdigest()
            lines.append("- %s: sha256:%s" % (pol, digest))
    lines.append("")
    tmp = seals_path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines))
    os.replace(tmp, seals_path)
    rep.note("sealed policy hashes into baselines/policy-seal.md")


def selfcheck(rep):
    sample = (
        "---\n"
        "type: ticket\n"
        "id: T-x4kq-login\n"
        "project_id: af-prj-98a2\n"
        "schema_version: 1.0.0\n"
        "created: 20261115T093000Z\n"
        "actor: agent\n"
        "role: agent\n"
        "lane: standard\n"
        "priority: must\n"
        "size: S\n"
        "title: login\n"
        "req_links:\n"
        "  - REQ-2tvx-reg\n"
        "---\nbody"
    )
    meta, body, err = parse_front_matter_content(sample)
    if err or meta.get("id") != "T-x4kq-login" or len(meta.get("req_links")) != 1:
        rep.error("<selfcheck>", "front-matter parser failed: %s" % err)
        return
    if TS_RE.match("20261115T093000Z") and ID_RE.match("T-x4kq-login"):
        rep.note("selfcheck passed: parser, timestamp, and id regexes OK")
    else:
        rep.error("<selfcheck>", "regex selfcheck failed")


# ---------------------------------------------------------------- validation runner

def run_validation(target_path, check_suite, rep, do_rebuild=False, do_seal=False, staged_only=False):
    root, af_dir = resolve_paths(target_path)
    if not os.path.isdir(af_dir):
        rep.error(root, "no .agentflow/ directory found at %s — run /af-start first" % af_dir)
        return

    # Check project.md
    proj_path = os.path.join(af_dir, "project.md")
    proj_meta, _, err = parse_front_matter(proj_path)
    if err:
        rep.error(proj_path, err)
    project_id = proj_meta.get("project_id", "")
    if not project_id or project_id.startswith("<"):
        rep.warn(proj_path, "project_id not configured yet (placeholder %r)" % project_id)
        project_id = ""

    suites = [s.strip().lower() for s in check_suite.split(",")] if check_suite else ["all"]
    run_all = "all" in suites

    # 1. Frontmatter and records
    if run_all or "frontmatter" in suites:
        counts = 0
        for sub in set(TYPE_DIRS.values()):
            sdir = os.path.join(af_dir, sub)
            if not os.path.isdir(sdir):
                continue
            for base, _, files in os.walk(sdir):
                for f in files:
                    if f.endswith(".md"):
                        counts += 1
                        check_record_file(rep, os.path.join(base, f), project_id)
        rep.note("scanned %d record files for frontmatter and schema compliance" % counts)

    # 2. Secrets scan
    if run_all or "secrets" in suites:
        for sub in set(TYPE_DIRS.values()):
            sdir = os.path.join(af_dir, sub)
            if not os.path.isdir(sdir):
                continue
            for base, _, files in os.walk(sdir):
                for f in files:
                    if f.endswith((".md", ".txt", ".json", ".log")):
                        check_secrets(rep, os.path.join(base, f))

    # 3. Gates
    if run_all or "gates" in suites:
        ticket_status = latest_ticket_status(af_dir)
        check_done_evidence(rep, af_dir, ticket_status)
        check_claims_evidence(rep, af_dir)
        check_state_freshness(rep, af_dir)
        check_assumptions(rep, af_dir)

    # 4. Manifest & Protected paths
    if run_all or "manifest" in suites:
        check_manifest_overlaps(rep, af_dir)
        check_manifest_compliance(rep, root, af_dir, staged_only=staged_only)
        check_protected_paths(rep, root, af_dir, staged_only=staged_only)

    # 5. Policy
    if run_all or "policy" in suites:
        check_policy_checksums(rep, af_dir)
        check_approval_traceability(rep, af_dir)

    # 6. Coverage
    if run_all or "coverage" in suites:
        check_coverage(rep, af_dir)

    if do_rebuild:
        rebuild_derived(rep, af_dir)
    if do_seal:
        seal_hashes(rep, af_dir)


# ---------------------------------------------------------------- CLI

def main():
    ap = argparse.ArgumentParser(description="Agentflow optional Tier-1 validator")
    ap.add_argument("path", nargs="?", default=".", help="Path to project root or .agentflow directory")
    ap.add_argument("--check", default="all",
                    help="Checks to run: all, frontmatter, gates, manifest, secrets, policy, coverage (or comma-separated)")
    ap.add_argument("--staged", action="store_true", help="Inspect git staged files for manifest and secrets")
    ap.add_argument("--rebuild", action="store_true", help="Rebuild derived index views deterministically")
    ap.add_argument("--seal", action="store_true", help="Write sha256 seals for policy files")
    ap.add_argument("--json", action="store_true", help="Emit report as JSON")
    ap.add_argument("--selfcheck", action="store_true", help="Validate validator itself")
    args = ap.parse_args()

    rep = Report(args.path or ".")
    if args.selfcheck:
        selfcheck(rep)
    else:
        run_validation(args.path, args.check, rep, do_rebuild=args.rebuild, do_seal=args.seal, staged_only=args.staged)

    if args.json:
        print(json.dumps({
            "errors": rep.errors,
            "warnings": rep.warnings,
            "notes": rep.notes,
            "exit": rep.exit_code
        }, indent=2))
    else:
        for e in rep.errors:
            print("ERROR  " + e)
        for w in rep.warnings:
            print("WARN   " + w)
        for n in rep.notes:
            print("note   " + n)
        result_label = "FAIL" if rep.errors else ("PASS with warnings" if rep.warnings else "PASS")
        print("result: %s (exit %d)" % (result_label, rep.exit_code))

    sys.exit(rep.exit_code)


if __name__ == "__main__":
    main()
