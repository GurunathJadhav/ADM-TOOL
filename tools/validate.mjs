#!/usr/bin/env node
/**
 * Agentflow Tier-1 validator — single-file, zero-dependency (Node 18+ ESM).
 *
 * Checks a project's `.agentflow/` state against the framework format spec:
 * front matter presence and required fields, allowed enum values, project_id consistency,
 * ID and timestamp formats, gate checks (done without evidence, claims without evidence),
 * STATE.md freshness, secrets scan in records, policy file checksums and approvals,
 * manifest compliance and overlap detection, protected path violations, test file changes,
 * approval traceability and countersigns, and coverage (orphan tickets/requirements).
 *
 * CLI:
 *     node validate.mjs [path-to-.agentflow] [--check=all|frontmatter|gates|manifest|secrets|policy|coverage]
 *     node validate.mjs [project-root] [--check=...] [--json] [--rebuild] [--seal] [--selfcheck] [--staged]
 *
 * Exit codes: 0 = pass, 1 = failure (errors found).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

// ---------------------------------------------------------------- constants

const REQUIRED_COMMON = ['type', 'id', 'project_id', 'schema_version', 'created', 'actor', 'role'];

const TYPE_DIRS = {
  ticket: 'tickets',
  question: 'questions',
  decision: 'decisions',
  manifest: 'manifests',
  baseline: 'baselines',
  verification: 'verifications',
  approval: 'approvals',
  claim: 'claims',
  blocker: 'blockers',
  review: 'reviews',
  requirement: 'requirements',
  glossary: 'glossary',
  risk: 'risks',
  lesson: 'lessons',
  environment: 'environment',
  waiver: 'waivers',
  evidence: 'evidence',
  event: 'events',
};

const TYPE_REQUIRED = {
  ticket: ['lane', 'size', 'title', 'req_links'],
  question: ['category', 'blocking'],
  decision: ['title', 'decision_type', 'status'],
  manifest: ['ticket_id', 'allowed_to_modify', 'edit_budget'],
  baseline: ['ticket_id'],
  verification: ['ticket_id', 'method', 'result'],
  approval: ['role', 'verbatim_quote'],
  claim: ['statement', 'label'],
  blocker: ['blocker_type', 'owner'],
  review: ['ticket_id', 'reviewer_type', 'verdict'],
  requirement: ['priority', 'status'],
  glossary: ['term'],
  risk: ['title', 'likelihood', 'impact'],
  lesson: ['title', 'category'],
  environment: ['fact_name', 'value', 'label'],
  waiver: ['rule', 'reason', 'role', 'expires'],
  evidence: ['ticket_id'],
  event: ['event_type', 'summary'],
};

const ALLOWED_ENUMS = {
  lane: new Set(['trivial', 'standard', 'incident', 'project-level']),
  priority: new Set(['must', 'should', 'could', 'wont', 'may']),
  moscow: new Set(['must', 'should', 'could', 'wont']),
  size: new Set(['s', 'm', 'l']),
  ticket_type: new Set(['story', 'task', 'spike', 'bug', 'change']),
  decision_type: new Set(['one-way', 'two-way']),
  label: new Set(['verified', 'inferred', 'unknown']),
  blocker_type: new Set(['human', 'technical']),
  verdict: new Set(['approved', 'changes-requested']),
  reviewer_type: new Set(['agent', 'human', 'fresh-session']),
  method: new Set([
    'automated-test', 'command-output', 'manual-check', 'screenshot/visual',
    'screenshot-visual', 'static-check', 'document-review', 'user-confirmation',
    'test', 'lint', 'typecheck', 'manual', 'audit'
  ]),
  result: new Set(['pass', 'fail', 'waived', 'unverified']),
  likelihood: new Set(['low', 'medium', 'high']),
  impact: new Set(['low', 'medium', 'high']),
};

const REQ_STATUS = new Set(['proposed', 'baselined', 'in-progress', 'delivered', 'descoped', 'dropped', 'active', 'deferred', 'deprecated']);

const TS_RE = /^\d{8}T\d{6}Z$/;
const ID_RE = /^[A-Z]{1,5}-[0-9a-km-np-tv-z]{4}-[a-z0-9-]{1,50}$/;

const SECRET_PATTERNS = [
  [/(?:sk-[a-zA-Z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|gho_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|glpat-[A-Za-z0-9-]{20,})/i, 'API token literal'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key id'],
  [/aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}/i, 'AWS secret access key'],
  [/[0-9a-f]{32}[^\n]{0,40}\bdatadog\b/i, 'Datadog key'],
  [/(?:password|passwd|secret|api[_-]?key|auth_token)\s*[:=]\s*['"][^'"]{8,}['"]/i, 'credential assignment'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key block'],
  [/(?:postgres|postgresql|mysql|mongodb|redis):\/\/[^:\s]+:[^@\s]+@/i, 'database URL with credentials'],
  [/Bearer\s+[A-Za-z0-9_\-\.]{25,}/, 'Bearer authentication token'],
];

const DEFAULT_PROTECTED_PATTERNS = [
  '.env', '.env.*', '.env*', 'secrets/*', 'private/*',
  '*.pem', '*.key', '*.p12', '*.pfx',
  '.agentflow/project.md', '.agentflow/gates.md', '.agentflow/lanes.md',
  '.agentflow/safety.md', '.agentflow/protected.md', '.agentflow/workflow-map.md',
  'AGENTS.md', 'CLAUDE.md', '.cursor/rules/*',
  'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'pnpm-lock.*',
  'Gemfile', 'Gemfile.lock', 'Pipfile', 'Pipfile.lock', 'pyproject.toml', 'poetry.lock',
  'requirements.txt', 'go.mod', 'go.sum', 'Cargo.toml', 'Cargo.lock', 'composer.json', 'composer.lock',
  'Dockerfile', '*.dockerfile', 'docker-compose*.yml', 'docker-compose*.yaml',
  '.github/*', '.github/workflows/*', '.gitlab-ci.yml', 'Jenkinsfile', '.circleci/*',
  'deploy/*', 'infra/*', 'infrastructure/*', 'terraform/*', '*.tf', 'k8s/*', 'helm/*',
  'migrations/*', 'db/migrate/*', 'alembic/*', 'prisma/migrations/*',
  'LICENSE', 'LICENSE*', 'LICENCE', 'LICENCE*',
  'jest.config.*', 'vitest.config.*', 'pytest.ini', '.coveragerc'
];

// ---------------------------------------------------------------- helpers

function nowCompact() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function parseFrontMatter(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8');
    return parseFrontMatterContent(text);
  } catch (err) {
    return { meta: {}, body: '', err: `unreadable: ${err.message}` };
  }
}

function parseFrontMatterContent(text) {
  text = text.replace(/\r\n/g, '\n');
  if (!text.startsWith('---')) {
    return { meta: {}, body: text, err: 'no front-matter block (must start with ---)' };
  }
  const end = text.indexOf('\n---', 3);
  if (end === -1) {
    return { meta: {}, body: text, err: 'front-matter block never closes' };
  }
  const metaText = text.slice(3, end).trimStart();
  const body = text.slice(end + 4).trimStart();
  const meta = {};
  let currentKey = null;

  for (const raw of metaText.split(/\r?\n/)) {
    const line = raw.trimEnd();
    if (!line || line.startsWith('#')) continue;

    if ((line.startsWith('  ') || line.startsWith('\t')) && currentKey) {
      const sub = line.trim();
      const val = sub.startsWith('- ') ? sub.slice(2).trim().replace(/^["']|["']$/g, '') : sub.replace(/^["']|["']$/g, '');
      if (Array.isArray(meta[currentKey])) {
        meta[currentKey].push(val);
      } else {
        meta[currentKey] = [val];
      }
      continue;
    }

    const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();

    if (val === '' || val === '|' || val === '>') {
      meta[key] = [];
      currentKey = key;
    } else if (val.startsWith('[') && val.endsWith(']')) {
      const items = val.slice(1, -1).split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      meta[key] = items;
      currentKey = null;
    } else {
      meta[key] = val.replace(/^["']|["']$/g, '');
      currentKey = null;
    }
  }

  return { meta, body, err: null };
}

class Report {
  constructor(root) {
    this.root = root;
    this.errors = [];
    this.warnings = [];
    this.notes = [];
  }

  error(filePath, msg) {
    const rel = fs.existsSync(filePath) ? path.relative(this.root, filePath) : filePath;
    this.errors.push(`${rel}: ${msg}`);
  }

  warn(filePath, msg) {
    const rel = fs.existsSync(filePath) ? path.relative(this.root, filePath) : filePath;
    this.warnings.push(`${rel}: ${msg}`);
  }

  note(msg) {
    this.notes.push(msg);
  }

  get exitCode() {
    return this.errors.length === 0 ? 0 : 1;
  }
}

function resolvePaths(targetPath) {
  const target = path.resolve(targetPath || '.');
  if (path.basename(target) === '.agentflow' && fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    return { root: path.dirname(target), afDir: target };
  }
  const nested = path.join(target, '.agentflow');
  if (fs.existsSync(nested) && fs.statSync(nested).isDirectory()) {
    return { root: target, afDir: nested };
  }
  if (fs.existsSync(path.join(target, 'project.md'))) {
    return { root: path.dirname(target), afDir: target };
  }
  return { root: target, afDir: nested };
}

// ---------------------------------------------------------------- checks

function checkRecordFile(rep, filePath, projectId) {
  const { meta, err } = parseFrontMatter(filePath);
  if (err) {
    rep.error(filePath, err);
    return null;
  }
  const rtype = meta.type;
  const rid = meta.id;

  if (!rtype || !TYPE_DIRS[rtype]) {
    rep.error(filePath, `unknown or missing type: ${JSON.stringify(rtype)}`);
    return meta;
  }

  for (const field of REQUIRED_COMMON) {
    if (meta[field] === undefined || (Array.isArray(meta[field]) && meta[field].length === 0)) {
      rep.error(filePath, `missing required field: ${field}`);
    }
  }

  if (rid && !ID_RE.test(String(rid))) {
    rep.error(filePath, `id ${JSON.stringify(rid)} does not match <Prefix>-<4 base32>-<slug>`);
  }

  if (projectId && meta.project_id && meta.project_id !== projectId) {
    rep.error(filePath, `project_id mismatch: ${JSON.stringify(meta.project_id)} != project ${JSON.stringify(projectId)}`);
  }

  const created = meta.created;
  if (created === 'unknown') {
    rep.warn(filePath, 'created: unknown — flagged until real clock backfills it');
  } else if (created && !TS_RE.test(String(created))) {
    rep.error(filePath, `created is not compact UTC (YYYYMMDDTHHMMSSZ): ${JSON.stringify(created)}`);
  }

  const requiredFields = TYPE_REQUIRED[rtype] || [];
  for (const field of requiredFields) {
    if (meta[field] === undefined || (Array.isArray(meta[field]) && meta[field].length === 0)) {
      rep.error(filePath, `missing type-specific field for ${rtype}: ${field}`);
    }
  }

  for (const [field, allowed] of Object.entries(ALLOWED_ENUMS)) {
    if (meta[field] !== undefined && !Array.isArray(meta[field])) {
      const val = String(meta[field]).toLowerCase();
      if (!allowed.has(val)) {
        rep.error(filePath, `${field} value ${JSON.stringify(meta[field])} not in allowed set (${Array.from(allowed).sort().join(', ')})`);
      }
    }
  }

  if (rtype === 'requirement' && meta.status && !Array.isArray(meta.status)) {
    if (!REQ_STATUS.has(String(meta.status).toLowerCase())) {
      rep.error(filePath, `requirement status ${JSON.stringify(meta.status)} not allowed`);
    }
  }

  return meta;
}

function checkSecrets(rep, filePath) {
  let text = '';
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch {
    return;
  }
  for (const [pattern, name] of SECRET_PATTERNS) {
    if (pattern.test(text)) {
      rep.error(filePath, `possible secret in record (${name}) — rotate and purge, see secrets-and-redaction skill`);
    }
  }
}

function latestTicketStatus(afDir) {
  const statuses = {};
  const eventsDir = path.join(afDir, 'events');
  if (!fs.existsSync(eventsDir) || !fs.statSync(eventsDir).isDirectory()) {
    return statuses;
  }
  const files = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.md')).sort();
  for (const name of files) {
    const m = name.match(/^(\d{8}T\d{6}Z|ts-unknown)-([A-Za-z0-9-]+)-(ticket-[a-z-]+|status-change|done|pass|fail)-(.+)\.md$/);
    if (m) {
      const ticket = m[2];
      const eventType = m[3];
      if (ticket && ticket !== 'none') {
        statuses[ticket] = eventType.replace('ticket-', '');
        continue;
      }
    }
    const { meta } = parseFrontMatter(path.join(eventsDir, name));
    const tid = meta.ticket_id || meta.target_id;
    const etype = meta.event_type || '';
    if (tid && tid !== 'none' && etype) {
      statuses[tid] = etype.replace('ticket-', '');
    }
  }
  return statuses;
}

function checkDoneEvidence(rep, afDir, ticketStatus) {
  const verifs = {};
  const vdir = path.join(afDir, 'verifications');
  if (fs.existsSync(vdir) && fs.statSync(vdir).isDirectory()) {
    for (const name of fs.readdirSync(vdir).filter((f) => f.endsWith('.md'))) {
      const p = path.join(vdir, name);
      const { meta, err } = parseFrontMatter(p);
      if (!err && meta.result === 'pass') {
        verifs[String(meta.ticket_id)] = { path: p, evRef: meta.evidence_ref };
      }
    }
  }

  const reviews = new Set();
  const rdir = path.join(afDir, 'reviews');
  if (fs.existsSync(rdir) && fs.statSync(rdir).isDirectory()) {
    for (const name of fs.readdirSync(rdir).filter((f) => f.endsWith('.md'))) {
      const { meta, err } = parseFrontMatter(path.join(rdir, name));
      if (!err && meta.ticket_id) {
        reviews.add(String(meta.ticket_id));
      }
    }
  }

  for (const [ticket, status] of Object.entries(ticketStatus)) {
    if (status !== 'done') continue;
    const tpath = path.join(afDir, 'tickets', `${ticket}.md`);
    let lane = 'standard';
    if (fs.existsSync(tpath)) {
      const { meta } = parseFrontMatter(tpath);
      lane = String(meta.lane || 'standard').toLowerCase();
    }
    if (!verifs[ticket]) {
      rep.error(tpath, "gate failure: ticket is marked 'done' but has no passing verification record");
    } else {
      const v = verifs[ticket];
      if (!v.evRef || ['none', 'n/a', ''].includes(String(v.evRef).toLowerCase())) {
        rep.error(v.path, `verification record for ticket ${ticket} has no evidence_ref`);
      }
    }
    if (lane === 'standard' && !reviews.has(ticket)) {
      rep.error(tpath, "gate failure: standard lane ticket is 'done' without an independent review record");
    }
  }
}

function checkClaimsEvidence(rep, afDir) {
  const cdir = path.join(afDir, 'claims');
  if (!fs.existsSync(cdir) || !fs.statSync(cdir).isDirectory()) return;

  for (const name of fs.readdirSync(cdir).filter((f) => f.endsWith('.md'))) {
    const p = path.join(cdir, name);
    const { meta, err } = parseFrontMatter(p);
    if (err || meta.type !== 'claim') continue;
    const label = String(meta.label || '').toLowerCase();
    if (label === 'verified') {
      const evRef = meta.evidence_ref;
      if (!evRef || ['none', 'n/a', ''].includes(String(evRef).toLowerCase())) {
        rep.error(p, `claim ${meta.id || name} is labeled 'verified' but has no evidence_ref`);
      } else if (typeof evRef === 'string' && (evRef.startsWith('evidence/') || evRef.startsWith('.agentflow/evidence/'))) {
        const evPath = path.join(afDir, evRef.replace('.agentflow/', ''));
        if (!fs.existsSync(evPath)) {
          rep.warn(p, `referenced evidence file does not exist: ${evRef}`);
        }
      }
    }
  }
}

function checkStateFreshness(rep, afDir) {
  const statePath = path.join(afDir, 'STATE.md');
  if (!fs.existsSync(statePath)) {
    rep.error(statePath, 'STATE.md missing — run /af-rebuild');
    return;
  }
  let text = '';
  try {
    text = fs.readFileSync(statePath, 'utf8');
  } catch (err) {
    rep.error(statePath, `cannot read STATE.md: ${err.message}`);
    return;
  }

  const m = text.match(/built_from:\s*([A-Za-z0-9-_.]+)/);
  let newestEvent = null;
  const eventsDir = path.join(afDir, 'events');
  if (fs.existsSync(eventsDir) && fs.statSync(eventsDir).isDirectory()) {
    const files = fs.readdirSync(eventsDir).filter((f) => f.endsWith('.md')).sort();
    if (files.length > 0) {
      newestEvent = path.basename(files[files.length - 1], '.md');
    }
  }

  if (newestEvent && (!m || m[1] !== newestEvent)) {
    rep.warn(statePath, `STATE.md is stale (built_from=${m ? m[1] : '?'}, newest event=${newestEvent}) — run /af-rebuild`);
  }
  for (const invariant of ['edit lock', 'next action']) {
    if (!text.toLowerCase().includes(invariant)) {
      rep.warn(statePath, `STATE.md missing expected invariant/section: ${invariant}`);
    }
  }
}

function checkManifestOverlaps(rep, afDir) {
  const mdir = path.join(afDir, 'manifests');
  if (!fs.existsSync(mdir) || !fs.statSync(mdir).isDirectory()) return;

  const ticketStatus = latestTicketStatus(afDir);
  const claims = {};

  for (const name of fs.readdirSync(mdir).filter((f) => f.endsWith('.md'))) {
    const p = path.join(mdir, name);
    const { meta, err } = parseFrontMatter(p);
    if (err || meta.type !== 'manifest') continue;
    const ticket = String(meta.ticket_id || name.slice(0, -3));
    if (['done', 'cancelled', 'superseded', 'deferred'].includes(ticketStatus[ticket])) continue;

    for (const field of ['allowed_to_modify', 'allowed_to_create']) {
      const val = meta[field];
      if (Array.isArray(val)) {
        for (const pat of val) {
          claims[pat] = claims[pat] || [];
          claims[pat].push(ticket);
        }
      } else if (val) {
        claims[val] = claims[val] || [];
        claims[val].push(ticket);
      }
    }
  }

  for (const [pattern, tickets] of Object.entries(claims)) {
    if (tickets.length > 1) {
      rep.error(mdir, `manifest overlap: ${JSON.stringify(pattern)} claimed by multiple active tickets: ${tickets.join(', ')} (§S5.2)`);
    }
  }
}

function getGitChangedFiles(root, stagedOnly = false) {
  try {
    const cmd = stagedOnly ? 'git diff --name-only --cached' : 'git diff --name-only HEAD';
    const out = execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 10000 });
    return out.split(/\r?\n/).map((s) => s.trim().replace(/\\/g, '/')).filter(Boolean);
  } catch {
    try {
      const out2 = execSync('git status --porcelain', { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], timeout: 10000 });
      const files = [];
      for (const line of out2.split(/\r?\n/)) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 2) {
          files.push(parts[1].replace(/\\/g, '/'));
        }
      }
      return files;
    } catch {
      return null;
    }
  }
}

function matchPattern(filePath, pattern) {
  const normFile = filePath.replace(/\\/g, '/');
  const normPat = pattern.replace(/\\/g, '/');
  if (normPat.endsWith('/*')) {
    const prefix = normPat.slice(0, -2);
    return normFile.startsWith(prefix + '/');
  }
  if (normPat.endsWith('/')) {
    return normFile.startsWith(normPat);
  }
  if (normPat.startsWith('*.')) {
    return normFile.endsWith(normPat.slice(1));
  }
  if (normPat.includes('*')) {
    const regex = new RegExp('^' + normPat.split('*').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
    return regex.test(normFile) || regex.test(path.basename(normFile));
  }
  return normFile === normPat || path.basename(normFile) === normPat;
}

function checkManifestCompliance(rep, root, afDir, stagedOnly = false) {
  const changedFiles = getGitChangedFiles(root, stagedOnly);
  if (!changedFiles) {
    rep.note('git not detected or clean repository — skipping git diff manifest check');
    return;
  }

  const codeChanges = changedFiles.filter((f) => !f.startsWith('.agentflow/'));
  if (codeChanges.length === 0) return;

  const statePath = path.join(afDir, 'STATE.md');
  let activeManifestPath = null;
  if (fs.existsSync(statePath)) {
    const text = fs.readFileSync(statePath, 'utf8');
    const m = text.match(/active_manifest:\s*([^\s\r\n]+)/);
    if (m && m[1].toLowerCase() !== 'none') {
      activeManifestPath = path.join(afDir, m[1].replace('.agentflow/', ''));
    }
  }

  const allowedPatterns = new Set();
  if (activeManifestPath && fs.existsSync(activeManifestPath)) {
    const { meta } = parseFrontMatter(activeManifestPath);
    for (const field of ['allowed_to_modify', 'allowed_to_create']) {
      const val = meta[field];
      if (Array.isArray(val)) {
        for (const v of val) allowedPatterns.add(v);
      } else if (val) {
        allowedPatterns.add(String(val));
      }
    }
  }

  for (const changed of codeChanges) {
    let matched = false;
    for (const pat of allowedPatterns) {
      if (matchPattern(changed, pat)) {
        matched = true;
        break;
      }
    }
    if (!matched) {
      rep.error(changed, `file modified off manifest: ${changed} (no active manifest allows this path)`);
    }

    const isTestFile = changed.toLowerCase().includes('test') || changed.toLowerCase().includes('spec') ||
      changed.endsWith('_test.go') || changed.endsWith('.test.js') || changed.endsWith('.spec.ts');
    if (isTestFile && !matched) {
      rep.error(changed, 'test file change without manifest entry or criterion link (§S6.3)');
    }
  }
}

function checkProtectedPaths(rep, root, afDir, stagedOnly = false) {
  const protectedFile = path.join(afDir, 'protected.md');
  const patterns = [...DEFAULT_PROTECTED_PATTERNS];
  if (fs.existsSync(protectedFile)) {
    try {
      const text = fs.readFileSync(protectedFile, 'utf8');
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (trimmed.startsWith('|') && !trimmed.startsWith('|---')) {
          const cols = trimmed.split('|').slice(1, -1).map((s) => s.trim());
          if (cols.length > 0 && cols[0] && !cols[0].startsWith('Path')) {
            patterns.push(cols[0].replace(/`/g, ''));
          }
        }
      }
    } catch {}
  }

  const changedFiles = getGitChangedFiles(root, stagedOnly);
  if (!changedFiles) return;

  let approvalsText = '';
  const appDir = path.join(afDir, 'approvals');
  if (fs.existsSync(appDir) && fs.statSync(appDir).isDirectory()) {
    for (const name of fs.readdirSync(appDir).filter((f) => f.endsWith('.md'))) {
      try {
        approvalsText += '\n' + fs.readFileSync(path.join(appDir, name), 'utf8');
      } catch {}
    }
  }

  for (const changed of changedFiles) {
    let isProtected = false;
    for (const pat of patterns) {
      if (matchPattern(changed, pat)) {
        isProtected = true;
        break;
      }
    }
    if (isProtected) {
      if (!approvalsText.includes(changed) && !approvalsText.includes(path.basename(changed))) {
        rep.error(changed, `protected path modified without approval record: ${changed} (§S5.6)`);
      }
    }
  }
}

function checkPolicyChecksums(rep, afDir) {
  const policies = ['project.md', 'gates.md', 'lanes.md', 'safety.md', 'protected.md', 'workflow-map.md'];
  for (const pol of policies) {
    if (!fs.existsSync(path.join(afDir, pol))) {
      rep.error(afDir, `required policy file missing: ${pol}`);
    }
  }

  const sealFile = path.join(afDir, 'baselines', 'policy-seal.md');
  if (fs.existsSync(sealFile)) {
    try {
      const content = fs.readFileSync(sealFile, 'utf8');
      for (const raw of content.split(/\r?\n/)) {
        const line = raw.trim();
        const m = line.match(/^-\s*([A-Za-z0-9_-]+\.md)\s*:\s*sha256:([0-9a-fA-F]{64})/);
        if (m) {
          const polName = m[1];
          const expectedHash = m[2].toLowerCase();
          const targetPath = path.join(afDir, polName);
          if (fs.existsSync(targetPath)) {
            const actualHash = crypto.createHash('sha256').update(fs.readFileSync(targetPath)).digest('hex').toLowerCase();
            if (actualHash !== expectedHash) {
              rep.error(targetPath, 'policy file hash mismatch! Modified without approved rule-change');
            }
          }
        }
      }
    } catch (err) {
      rep.warn(sealFile, `failed to parse policy seal: ${err.message}`);
    }
  }
}

function checkApprovalTraceability(rep, afDir) {
  const appDir = path.join(afDir, 'approvals');
  const approvals = {};
  if (fs.existsSync(appDir) && fs.statSync(appDir).isDirectory()) {
    for (const name of fs.readdirSync(appDir).filter((f) => f.endsWith('.md'))) {
      const p = path.join(appDir, name);
      const { meta, err } = parseFrontMatter(p);
      if (!err && meta.id) {
        approvals[meta.id] = meta;
        const target = meta.target_record || meta.approves_id;
        if (target) approvals[target] = meta;
      }
    }
  }

  for (const [aid, ameta] of Object.entries(approvals)) {
    if (typeof ameta === 'object' && ['yes', 'true'].includes(String(ameta.high_risk || '').toLowerCase())) {
      const cm = ameta.countersign_method;
      if (!cm || ['n/a', 'none', ''].includes(String(cm).toLowerCase())) {
        rep.error(path.join(appDir, `${ameta.id || aid}.md`), 'high-risk approval lacks required countersign (§S2.2)');
      }
    }
  }

  const mdir = path.join(afDir, 'manifests');
  if (fs.existsSync(mdir) && fs.statSync(mdir).isDirectory()) {
    const ticketStatus = latestTicketStatus(afDir);
    for (const name of fs.readdirSync(mdir).filter((f) => f.endsWith('.md'))) {
      const p = path.join(mdir, name);
      const { meta } = parseFrontMatter(p);
      const tid = meta.ticket_id || '';
      if (['in-progress', 'in-review', 'done'].includes(ticketStatus[tid])) {
        const appRef = meta.approval_ref;
        const mid = meta.id || name.slice(0, -3);
        if (!appRef && !approvals[mid] && !approvals[tid]) {
          rep.error(p, `manifest for active ticket ${tid} has no linked approval record`);
        }
      }
    }
  }
}

function checkCoverage(rep, afDir) {
  const reqIds = new Set();
  const ticketReqs = {};

  const rdir = path.join(afDir, 'requirements');
  if (fs.existsSync(rdir) && fs.statSync(rdir).isDirectory()) {
    for (const name of fs.readdirSync(rdir).filter((f) => f.endsWith('.md'))) {
      const p = path.join(rdir, name);
      const { meta } = parseFrontMatter(p);
      if (['delivered', 'descoped', 'dropped', 'deprecated'].includes(String(meta.status || '').toLowerCase())) continue;
      if (meta.id) reqIds.add(String(meta.id));
    }
  }

  const tdir = path.join(afDir, 'tickets');
  if (fs.existsSync(tdir) && fs.statSync(tdir).isDirectory()) {
    for (const name of fs.readdirSync(tdir).filter((f) => f.endsWith('.md'))) {
      const p = path.join(tdir, name);
      const { meta } = parseFrontMatter(p);
      const links = meta.req_links;
      if (Array.isArray(links)) {
        ticketReqs[name] = links.map(String);
      } else if (links) {
        ticketReqs[name] = [String(links)];
      }
    }
  }

  const covered = new Set();
  for (const [tname, reqs] of Object.entries(ticketReqs)) {
    if (!reqs || reqs.length === 0) {
      rep.error(path.join(tdir, tname), 'orphan ticket: ticket has no req_links (§S3)');
    } else {
      for (const r of reqs) {
        if (r && r !== 'none') covered.add(r);
      }
    }
  }

  for (const r of Array.from(reqIds).sort()) {
    if (!covered.has(r)) {
      rep.error(path.join(afDir, 'requirements'), `orphan requirement: ${r} maps to no ticket (§S3)`);
    }
  }
}

function checkAssumptions(rep, afDir) {
  const qdir = path.join(afDir, 'questions');
  if (!fs.existsSync(qdir) || !fs.statSync(qdir).isDirectory()) return;

  for (const name of fs.readdirSync(qdir).filter((f) => f.endsWith('.md'))) {
    const p = path.join(qdir, name);
    const { meta } = parseFrontMatter(p);
    if (String(meta.blocking || '').toLowerCase() === 'true') {
      const qid = meta.id || name.slice(0, -3);
      rep.warn(p, `blocking question ${qid} appears open — discovery gate cannot close while open`);
    }
  }
}

// ---------------------------------------------------------------- rebuild & seal

function sealHashes(rep, afDir) {
  const baseDir = path.join(afDir, 'baselines');
  fs.mkdirSync(baseDir, { recursive: true });
  const sealsPath = path.join(baseDir, 'policy-seal.md');
  const lines = [
    '---',
    'type: baseline',
    'id: B-0000-policy-seal',
    'project_id: tooling-seal',
    'schema_version: 1.0.0',
    `created: ${nowCompact()}`,
    'actor: validator',
    'role: agent',
    'ticket_id: none',
    'tree_status: clean',
    '---',
    '',
    '# Policy file hash seal',
    '',
    '<!-- Tooling seal: hashes only, never project data. -->',
    ''
  ];

  for (const pol of ['project.md', 'gates.md', 'lanes.md', 'safety.md', 'protected.md', 'workflow-map.md']) {
    const p = path.join(afDir, pol);
    if (fs.existsSync(p)) {
      const digest = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
      lines.push(`- ${pol}: sha256:${digest}`);
    }
  }
  lines.push('');
  fs.writeFileSync(sealsPath, lines.join('\n'), 'utf8');
  rep.note('sealed policy hashes into baselines/policy-seal.md');
}

function selfcheck(rep) {
  const sample = `---
type: ticket
id: T-x4kq-login
project_id: af-prj-98a2
schema_version: 1.0.0
created: 20261115T093000Z
actor: agent
role: agent
lane: standard
priority: must
size: S
title: login
req_links:
  - REQ-2tvx-reg
---
body`;
  const { meta, err } = parseFrontMatterContent(sample);
  if (err || meta.id !== 'T-x4kq-login' || !Array.isArray(meta.req_links) || meta.req_links.length !== 1) {
    rep.error('<selfcheck>', `front-matter parser failed: ${err}`);
    return;
  }
  if (TS_RE.test('20261115T093000Z') && ID_RE.test('T-x4kq-login')) {
    rep.note('selfcheck passed: parser, timestamp, and id regexes OK');
  } else {
    rep.error('<selfcheck>', 'regex selfcheck failed');
  }
}

// ---------------------------------------------------------------- runner

function runValidation(targetPath, checkSuite, rep, options = {}) {
  const { root, afDir } = resolvePaths(targetPath);
  if (!fs.existsSync(afDir) || !fs.statSync(afDir).isDirectory()) {
    rep.error(root, `no .agentflow/ directory found at ${afDir} — run /af-start first`);
    return;
  }

  const projPath = path.join(afDir, 'project.md');
  const { meta: projMeta, err } = parseFrontMatter(projPath);
  if (err) rep.error(projPath, err);
  let projectId = projMeta.project_id || '';
  if (!projectId || projectId.startsWith('<')) {
    rep.warn(projPath, `project_id not configured yet (placeholder ${JSON.stringify(projectId)})`);
    projectId = '';
  }

  const suites = (checkSuite || 'all').split(',').map((s) => s.trim().toLowerCase());
  const runAll = suites.includes('all');

  if (runAll || suites.includes('frontmatter')) {
    let counts = 0;
    for (const sub of new Set(Object.values(TYPE_DIRS))) {
      const sdir = path.join(afDir, sub);
      if (!fs.existsSync(sdir) || !fs.statSync(sdir).isDirectory()) continue;
      const walk = (d) => {
        for (const item of fs.readdirSync(d)) {
          const full = path.join(d, item);
          if (fs.statSync(full).isDirectory()) walk(full);
          else if (item.endsWith('.md')) {
            counts++;
            checkRecordFile(rep, full, projectId);
          }
        }
      };
      walk(sdir);
    }
    rep.note(`scanned ${counts} record files for frontmatter and schema compliance`);
  }

  if (runAll || suites.includes('secrets')) {
    for (const sub of new Set(Object.values(TYPE_DIRS))) {
      const sdir = path.join(afDir, sub);
      if (!fs.existsSync(sdir) || !fs.statSync(sdir).isDirectory()) continue;
      const walk = (d) => {
        for (const item of fs.readdirSync(d)) {
          const full = path.join(d, item);
          if (fs.statSync(full).isDirectory()) walk(full);
          else if (/\.(md|txt|json|log)$/i.test(item)) checkSecrets(rep, full);
        }
      };
      walk(sdir);
    }
  }

  if (runAll || suites.includes('gates')) {
    const ticketStatus = latestTicketStatus(afDir);
    checkDoneEvidence(rep, afDir, ticketStatus);
    checkClaimsEvidence(rep, afDir);
    checkStateFreshness(rep, afDir);
    checkAssumptions(rep, afDir);
  }

  if (runAll || suites.includes('manifest')) {
    checkManifestOverlaps(rep, afDir);
    checkManifestCompliance(rep, root, afDir, options.staged);
    checkProtectedPaths(rep, root, afDir, options.staged);
  }

  if (runAll || suites.includes('policy')) {
    checkPolicyChecksums(rep, afDir);
    checkApprovalTraceability(rep, afDir);
  }

  if (runAll || suites.includes('coverage')) {
    checkCoverage(rep, afDir);
  }

  if (options.seal) {
    sealHashes(rep, afDir);
  }
}

// ---------------------------------------------------------------- CLI

function main() {
  const args = process.argv.slice(2);
  let targetPath = '.';
  let checkSuite = 'all';
  let isJson = false;
  let isSelfcheck = false;
  let isSeal = false;
  let isStaged = false;

  for (const arg of args) {
    if (arg === '--selfcheck') isSelfcheck = true;
    else if (arg === '--json') isJson = true;
    else if (arg === '--seal') isSeal = true;
    else if (arg === '--staged') isStaged = true;
    else if (arg.startsWith('--check=')) checkSuite = arg.slice(8);
    else if (!arg.startsWith('--')) targetPath = arg;
  }

  const rep = new Report(targetPath || '.');
  if (isSelfcheck) {
    selfcheck(rep);
  } else {
    runValidation(targetPath, checkSuite, rep, { seal: isSeal, staged: isStaged });
  }

  if (isJson) {
    console.log(JSON.stringify({
      errors: rep.errors,
      warnings: rep.warnings,
      notes: rep.notes,
      exit: rep.exitCode,
    }, null, 2));
  } else {
    for (const e of rep.errors) console.log('ERROR  ' + e);
    for (const w of rep.warnings) console.log('WARN   ' + w);
    for (const n of rep.notes) console.log('note   ' + n);
    const resultLabel = rep.errors.length > 0 ? 'FAIL' : (rep.warnings.length > 0 ? 'PASS with warnings' : 'PASS');
    console.log(`result: ${resultLabel} (exit ${rep.exitCode})`);
  }

  process.exit(rep.exitCode);
}

main();
