<#
.SYNOPSIS
    Agentflow Tier-1 validator for Windows environments (PowerShell 5.1+ / 7+).
.DESCRIPTION
    Zero-dependency validator using only built-in PowerShell cmdlets.
    Checks: front matter presence and required fields, allowed enum values,
    project_id consistency, ID and timestamp formats, gate checks (done evidence,
    claims evidence), STATE.md freshness, secrets scan, policy file checksums,
    manifest compliance and overlap detection, protected path violations,
    approval traceability and countersigns, and coverage (orphan tickets/requirements).
.PARAMETER Path
    Path to project root or .agentflow directory (defaults to current directory).
.PARAMETER Check
    Check suite to run: all, frontmatter, gates, manifest, secrets, policy, coverage.
.PARAMETER Staged
    Inspect git staged files for manifest compliance and secrets.
.PARAMETER Seal
    Compute and write sha256 baseline hashes for policy files.
.PARAMETER SelfCheck
    Validate the parser and regex rules internally.
.PARAMETER Json
    Emit output report as JSON.
.EXAMPLE
    .\validate.ps1 -Path . -Check all
    .\validate.ps1 -Path .agentflow -Check frontmatter
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Path = ".",

    [Parameter(Position = 1)]
    [ValidateSet("all", "frontmatter", "gates", "manifest", "secrets", "policy", "coverage")]
    [string]$Check = "all",

    [switch]$Staged,
    [switch]$Seal,
    [switch]$SelfCheck,
    [switch]$Json
)

Set-StrictMode -Off
$ErrorActionPreference = "Continue"

# ---------------------------------------------------------------- Constants

$REQUIRED_COMMON = @("type", "id", "project_id", "schema_version", "created", "actor", "role")

$RECORD_DIRS = @{
    "ticket" = "tickets"; "question" = "questions"; "decision" = "decisions"
    "manifest" = "manifests"; "baseline" = "baselines"; "verification" = "verifications"
    "approval" = "approvals"; "claim" = "claims"; "blocker" = "blockers"
    "review" = "reviews"; "requirement" = "requirements"; "glossary" = "glossary"
    "risk" = "risks"; "lesson" = "lessons"; "environment" = "environment"
    "waiver" = "waivers"; "evidence" = "evidence"; "event" = "events"
}

$TYPE_REQUIRED = @{
    "ticket" = @("lane", "size", "title", "req_links")
    "question" = @("category", "blocking")
    "decision" = @("title", "decision_type", "status")
    "manifest" = @("ticket_id", "allowed_to_modify", "edit_budget")
    "baseline" = @("ticket_id")
    "verification" = @("ticket_id", "method", "result")
    "approval" = @("role", "verbatim_quote")
    "claim" = @("statement", "label")
    "blocker" = @("blocker_type", "owner")
    "review" = @("ticket_id", "reviewer_type", "verdict")
    "requirement" = @("priority", "status")
    "glossary" = @("term")
    "risk" = @("title", "likelihood", "impact")
    "lesson" = @("title", "category")
    "environment" = @("fact_name", "value", "label")
    "waiver" = @("rule", "reason", "role", "expires")
    "evidence" = @("ticket_id")
    "event" = @("event_type", "summary")
}

$ALLOWED_ENUMS = @{
    "lane" = @("trivial", "standard", "incident", "project-level")
    "priority" = @("must", "should", "could", "wont", "may")
    "moscow" = @("must", "should", "could", "wont")
    "size" = @("s", "m", "l")
    "ticket_type" = @("story", "task", "spike", "bug", "change")
    "decision_type" = @("one-way", "two-way")
    "label" = @("verified", "inferred", "unknown")
    "blocker_type" = @("human", "technical")
    "verdict" = @("approved", "changes-requested")
    "reviewer_type" = @("agent", "human", "fresh-session")
    "method" = @("automated-test", "command-output", "manual-check", "screenshot/visual", "screenshot-visual", "static-check", "document-review", "user-confirmation", "test", "lint", "typecheck", "manual", "audit")
    "result" = @("pass", "fail", "waived", "unverified")
    "likelihood" = @("low", "medium", "high")
    "impact" = @("low", "medium", "high")
}

$REQ_STATUS = @("proposed", "baselined", "in-progress", "delivered", "descoped", "dropped", "active", "deferred", "deprecated")

$TS_PATTERN = "^\d{8}T\d{6}Z$"
$ID_PATTERN = "^[A-Z]{1,5}-[0-9a-km-np-tv-z]{4}-[a-z0-9-]{1,50}$"

$SECRET_PATTERNS = @(
    @{ Pattern = "(?i)\b(sk-[a-zA-Z0-9]{20,}|ghp_[A-Za-z0-9]{30,}|gho_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|glpat-[A-Za-z0-9-]{20,})\b"; Name = "API token literal" },
    @{ Pattern = "\bAKIA[0-9A-Z]{16}\b"; Name = "AWS access key id" },
    @{ Pattern = "(?i)\baws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}\b"; Name = "AWS secret access key" },
    @{ Pattern = "(?i)\b[0-9a-f]{32}\b[^\n]{0,40}\bdatadog\b"; Name = "Datadog key" },
    @{ Pattern = "(?i)(password|passwd|secret|api[_-]?key|auth_token)\s*[:=]\s*['""][^'""]{8,}['""]"; Name = "credential assignment" },
    @{ Pattern = "-----BEGIN [A-Z ]*PRIVATE KEY-----"; Name = "private key block" },
    @{ Pattern = "(?i)\b(postgres|postgresql|mysql|mongodb|redis)://[^:\s]+:[^@\s]+@"; Name = "database URL with credentials" },
    @{ Pattern = "Bearer\s+[A-Za-z0-9_\-\.]{25,}"; Name = "Bearer authentication token" }
)

$DEFAULT_PROTECTED_PATTERNS = @(
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
)

# ---------------------------------------------------------------- Report Class

$Report = [PSCustomObject]@{
    Errors = [System.Collections.Generic.List[string]]::new()
    Warnings = [System.Collections.Generic.List[string]]::new()
    Notes = [System.Collections.Generic.List[string]]::new()
    Root = $Path
}

function Add-Error($filePath, $msg) {
    $rel = if (Test-Path $filePath) { (Resolve-Path -Path $filePath -Relative).TrimStart(".\") } else { $filePath }
    $Report.Errors.Add("$rel`: $msg")
}

function Add-Warn($filePath, $msg) {
    $rel = if (Test-Path $filePath) { (Resolve-Path -Path $filePath -Relative).TrimStart(".\") } else { $filePath }
    $Report.Warnings.Add("$rel`: $msg")
}

function Add-Note($msg) {
    $Report.Notes.Add($msg)
}

# ---------------------------------------------------------------- Helpers

function Get-NowCompact {
    return [DateTime]::UtcNow.ToString("yyyyMMddTHHmmssZ")
}

function Parse-FrontMatter($filePath) {
    if (-not (Test-Path $filePath)) {
        return @{ Meta = @{}; Body = ""; Error = "file not found: $filePath" }
    }
    try {
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        return (Parse-FrontMatterContent $content)
    } catch {
        return @{ Meta = @{}; Body = ""; Error = "unreadable: $($_.Exception.Message)" }
    }
}

function Parse-FrontMatterContent([string]$content) {
    $normalized = $content -replace "\r\n", "`n"
    if (-not $normalized.StartsWith("---")) {
        return @{ Meta = @{}; Body = $content; Error = "no front-matter block (must start with ---)" }
    }
    if ($normalized -match "(?s)^---\n(.*?)\n---\n?(.*)$") {
        $metaText = $matches[1]
        $body = $matches[2]
    } else {
        return @{ Meta = @{}; Body = $content; Error = "front-matter block never closes" }
    }

    $meta = @{}
    $currentKey = $null

    $lines = $metaText -split "\n"
    foreach ($raw in $lines) {
        $line = $raw.TrimEnd()
        if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
            continue
        }
        if (($line.StartsWith("  ") -or $line.StartsWith("`t")) -and $null -ne $currentKey) {
            $sub = $line.Trim()
            $val = if ($sub.StartsWith("- ")) { $sub.Substring(2).Trim().Trim('"').Trim("'") } else { $sub.Trim('"').Trim("'") }
            if ($meta[$currentKey] -is [System.Collections.IList]) {
                [void]$meta[$currentKey].Add($val)
            } else {
                $meta[$currentKey] = [System.Collections.Generic.List[string]]::new(@($val))
            }
            continue
        }

        if ($line -match "^([A-Za-z0-9_-]+)\s*:\s*(.*)$") {
            $key = $matches[1]
            $val = $matches[2].Trim()
            if ($val -eq "" -or $val -eq "|" -or $val -eq ">") {
                $meta[$key] = [System.Collections.Generic.List[string]]::new()
                $currentKey = $key
            } elseif ($val.StartsWith("[") -and $val.EndsWith("]")) {
                $list = [System.Collections.Generic.List[string]]::new()
                $rawItems = $val.Substring(1, $val.Length - 2) -split ","
                foreach ($item in $rawItems) {
                    $trimmed = $item.Trim().Trim('"').Trim("'")
                    if (-not [string]::IsNullOrWhiteSpace($trimmed)) {
                        [void]$list.Add($trimmed)
                    }
                }
                $meta[$key] = $list
                $currentKey = $null
            } else {
                $meta[$key] = $val.Trim('"').Trim("'")
                $currentKey = $null
            }
        }
    }

    return @{ Meta = $meta; Body = $body; Error = $null }
}

function Resolve-AfPaths($targetPath) {
    $full = Resolve-Path -Path $targetPath -ErrorAction SilentlyContinue
    $p = if ($full) { $full.Path } else { [System.IO.Path]::GetFullPath($targetPath) }

    if ((Split-Path $p -Leaf) -eq ".agentflow" -and (Test-Path $p -PathType Container)) {
        return @{ Root = (Split-Path $p -Parent); AfDir = $p }
    }
    $nested = Join-Path $p ".agentflow"
    if (Test-Path $nested -PathType Container) {
        return @{ Root = $p; AfDir = $nested }
    }
    if (Test-Path (Join-Path $p "project.md") -PathType Leaf) {
        return @{ Root = (Split-Path $p -Parent); AfDir = $p }
    }
    return @{ Root = $p; AfDir = $nested }
}

# ---------------------------------------------------------------- Checks

function Test-RecordFile($filePath, $projectId) {
    $res = Parse-FrontMatter $filePath
    if ($res.Error) {
        Add-Error $filePath $res.Error
        return $null
    }
    $meta = $res.Meta
    $rtype = $meta["type"]
    $rid = $meta["id"]

    if (-not $rtype -or -not $RECORD_DIRS.ContainsKey($rtype)) {
        Add-Error $filePath "unknown or missing type: '$rtype'"
        return $meta
    }

    foreach ($field in $REQUIRED_COMMON) {
        if (-not $meta.ContainsKey($field) -or ($meta[$field] -is [System.Collections.IList] -and $meta[$field].Count -eq 0)) {
            Add-Error $filePath "missing required common field: $field"
        }
    }

    if ($rid -and $rid -notmatch $ID_PATTERN) {
        Add-Error $filePath "id '$rid' does not match <Prefix>-<4 base32>-<slug>"
    }

    if ($projectId -and $meta.ContainsKey("project_id") -and $meta["project_id"] -ne $projectId) {
        Add-Error $filePath "project_id mismatch: '$($meta['project_id'])' != project '$projectId'"
    }

    $created = $meta["created"]
    if ($created -eq "unknown") {
        Add-Warn $filePath "created: unknown — flagged until clock backfills it"
    } elseif ($created -and $created -notmatch $TS_PATTERN) {
        Add-Error $filePath "created is not compact UTC (YYYYMMDDTHHMMSSZ): '$created'"
    }

    if ($TYPE_REQUIRED.ContainsKey($rtype)) {
        foreach ($field in $TYPE_REQUIRED[$rtype]) {
            if (-not $meta.ContainsKey($field) -or ($meta[$field] -is [System.Collections.IList] -and $meta[$field].Count -eq 0)) {
                Add-Error $filePath "missing type-specific field for $rtype`: $field"
            }
        }
    }

    foreach ($entry in $ALLOWED_ENUMS.GetEnumerator()) {
        $field = $entry.Key
        $allowed = $entry.Value
        if ($meta.ContainsKey($field) -and -not ($meta[$field] -is [System.Collections.IList])) {
            $val = [string]$meta[$field].ToLower()
            if ($allowed -notcontains $val) {
                Add-Error $filePath "$field value '$($meta[$field])' not in allowed set ($($allowed -join ', '))"
            }
        }
    }

    if ($rtype -eq "requirement" -and $meta.ContainsKey("status") -and -not ($meta["status"] -is [System.Collections.IList])) {
        $st = [string]$meta["status"].ToLower()
        if ($REQ_STATUS -notcontains $st) {
            Add-Error $filePath "requirement status '$($meta['status'])' not allowed"
        }
    }

    return $meta
}

function Test-SecretsInFile($filePath) {
    try {
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    } catch { return }

    foreach ($sec in $SECRET_PATTERNS) {
        if ($content -match $sec.Pattern) {
            Add-Error $filePath "possible secret in record ($($sec.Name)) — rotate and purge, see secrets-and-redaction skill"
        }
    }
}

function Get-LatestTicketStatuses($afDir) {
    $statuses = @{}
    $eventsDir = Join-Path $afDir "events"
    if (-not (Test-Path $eventsDir -PathType Container)) {
        return $statuses
    }
    $files = Get-ChildItem -Path $eventsDir -Filter "*.md" | Sort-Object Name
    foreach ($file in $files) {
        $name = $file.Name
        if ($name -match "^(\d{8}T\d{6}Z|ts-unknown)-([A-Za-z0-9-]+)-(ticket-[a-z-]+|status-change|done|pass|fail)-(.+)\.md$") {
            $ticket = $matches[2]
            $eventType = $matches[3]
            if ($ticket -and $ticket -ne "none") {
                $statuses[$ticket] = $eventType.Replace("ticket-", "")
                continue
            }
        }
        $fm = Parse-FrontMatter $file.FullName
        $tid = if ($fm.Meta.ContainsKey("ticket_id")) { $fm.Meta["ticket_id"] } else { $fm.Meta["target_id"] }
        $etype = $fm.Meta["event_type"]
        if ($tid -and $tid -ne "none" -and $etype) {
            $statuses[$tid] = $etype.Replace("ticket-", "")
        }
    }
    return $statuses
}

function Test-DoneEvidence($afDir, $statuses) {
    $verifs = @{}
    $vdir = Join-Path $afDir "verifications"
    if (Test-Path $vdir -PathType Container) {
        Get-ChildItem -Path $vdir -Filter "*.md" | ForEach-Object {
            $fm = Parse-FrontMatter $_.FullName
            if (-not $fm.Error -and $fm.Meta["result"] -eq "pass") {
                $verifs[[string]$fm.Meta["ticket_id"]] = @{ Path = $_.FullName; EvRef = $fm.Meta["evidence_ref"] }
            }
        }
    }

    $reviews = [System.Collections.Generic.HashSet[string]]::new()
    $rdir = Join-Path $afDir "reviews"
    if (Test-Path $rdir -PathType Container) {
        Get-ChildItem -Path $rdir -Filter "*.md" | ForEach-Object {
            $fm = Parse-FrontMatter $_.FullName
            if (-not $fm.Error -and $fm.Meta.ContainsKey("ticket_id")) {
                [void]$reviews.Add([string]$fm.Meta["ticket_id"])
            }
        }
    }

    foreach ($entry in $statuses.GetEnumerator()) {
        $ticket = $entry.Key
        $status = $entry.Value
        if ($status -ne "done") { continue }

        $tpath = Join-Path (Join-Path $afDir "tickets") "$ticket.md"
        $lane = "standard"
        if (Test-Path $tpath) {
            $fm = Parse-FrontMatter $tpath
            if ($fm.Meta.ContainsKey("lane")) { $lane = [string]$fm.Meta["lane"].ToLower() }
        }

        if (-not $verifs.ContainsKey($ticket)) {
            Add-Error $tpath "gate failure: ticket is marked 'done' but has no passing verification record"
        } else {
            $v = $verifs[$ticket]
            if (-not $v.EvRef -or @("none", "n/a", "") -contains [string]$v.EvRef.ToLower()) {
                Add-Error $v.Path "verification record for ticket $ticket has no evidence_ref"
            }
        }

        if ($lane -eq "standard" -and -not $reviews.Contains($ticket)) {
            Add-Error $tpath "gate failure: standard lane ticket is 'done' without an independent review record"
        }
    }
}

function Test-ClaimsEvidence($afDir) {
    $cdir = Join-Path $afDir "claims"
    if (-not (Test-Path $cdir -PathType Container)) { return }

    Get-ChildItem -Path $cdir -Filter "*.md" | ForEach-Object {
        $fm = Parse-FrontMatter $_.FullName
        if (-not $fm.Error -and $fm.Meta["type"] -eq "claim") {
            $lbl = [string]$fm.Meta["label"].ToLower()
            if ($lbl -eq "verified") {
                $evRef = $fm.Meta["evidence_ref"]
                if (-not $evRef -or @("none", "n/a", "") -contains [string]$evRef.ToLower()) {
                    Add-Error $_.FullName "claim $($fm.Meta['id']) is labeled 'verified' but has no evidence_ref"
                } elseif ($evRef -is [string] -and ($evRef.StartsWith("evidence/") -or $evRef.StartsWith(".agentflow/evidence/"))) {
                    $evPath = Join-Path $afDir ($evRef.Replace(".agentflow/", "").Replace("/", "\"))
                    if (-not (Test-Path $evPath)) {
                        Add-Warn $_.FullName "referenced evidence file does not exist: $evRef"
                    }
                }
            }
        }
    }
}

function Test-StateFreshness($afDir) {
    $statePath = Join-Path $afDir "STATE.md"
    if (-not (Test-Path $statePath)) {
        Add-Error $statePath "STATE.md missing — run /af-rebuild"
        return
    }
    $text = Get-Content -Path $statePath -Raw -Encoding UTF8
    $builtFrom = $null
    if ($text -match "built_from:\s*([A-Za-z0-9-_.]+)") {
        $builtFrom = $matches[1]
    }
    $eventsDir = Join-Path $afDir "events"
    $newestEvent = $null
    if (Test-Path $eventsDir -PathType Container) {
        $files = Get-ChildItem -Path $eventsDir -Filter "*.md" | Sort-Object Name
        if ($files.Count -gt 0) {
            $newestEvent = [System.IO.Path]::GetFileNameWithoutExtension($files[-1].Name)
        }
    }
    if ($newestEvent -and ($null -eq $builtFrom -or $builtFrom -ne $newestEvent)) {
        Add-Warn $statePath "STATE.md is stale (built_from=$builtFrom, newest event=$newestEvent) — run /af-rebuild"
    }

    foreach ($invariant in @("edit lock", "next action")) {
        if (-not $text.ToLower().Contains($invariant)) {
            Add-Warn $statePath "STATE.md missing expected invariant/section: $invariant"
        }
    }
}

function Test-ManifestOverlaps($afDir) {
    $mdir = Join-Path $afDir "manifests"
    if (-not (Test-Path $mdir -PathType Container)) { return }

    $statuses = Get-LatestTicketStatuses $afDir
    $claims = @{}

    Get-ChildItem -Path $mdir -Filter "*.md" | ForEach-Object {
        $fm = Parse-FrontMatter $_.FullName
        if (-not $fm.Error -and $fm.Meta["type"] -eq "manifest") {
            $ticket = [string](if ($fm.Meta.ContainsKey("ticket_id")) { $fm.Meta["ticket_id"] } else { [System.IO.Path]::GetFileNameWithoutExtension($_.Name) })
            if (@("done", "cancelled", "superseded", "deferred") -notcontains $statuses[$ticket]) {
                foreach ($f in @("allowed_to_modify", "allowed_to_create")) {
                    if ($fm.Meta.ContainsKey($f)) {
                        $val = $fm.Meta[$f]
                        if ($val -is [System.Collections.IList]) {
                            foreach ($pat in $val) {
                                if (-not $claims.ContainsKey($pat)) { $claims[$pat] = [System.Collections.Generic.List[string]]::new() }
                                [void]$claims[$pat].Add($ticket)
                            }
                        } elseif ($val) {
                            $pat = [string]$val
                            if (-not $claims.ContainsKey($pat)) { $claims[$pat] = [System.Collections.Generic.List[string]]::new() }
                            [void]$claims[$pat].Add($ticket)
                        }
                    }
                }
            }
        }
    }

    foreach ($entry in $claims.GetEnumerator()) {
        if ($entry.Value.Count -gt 1) {
            Add-Error $mdir "manifest overlap: '$($entry.Key)' claimed by multiple active tickets: $($entry.Value -join ', ') (§S5.2)"
        }
    }
}

function Test-PolicyChecksums($afDir) {
    $policies = @("project.md", "gates.md", "lanes.md", "safety.md", "protected.md", "workflow-map.md")
    foreach ($pol in $policies) {
        $p = Join-Path $afDir $pol
        if (-not (Test-Path $p)) {
            Add-Error $afDir "required policy file missing: $pol"
        }
    }

    $sealFile = Join-Path (Join-Path $afDir "baselines") "policy-seal.md"
    if (Test-Path $sealFile) {
        $content = Get-Content -Path $sealFile -Raw -Encoding UTF8
        $lines = $content -split "\r?\n"
        foreach ($line in $lines) {
            if ($line -match "^-\s*([A-Za-z0-9_-]+\.md)\s*:\s*sha256:([0-9a-fA-F]{64})") {
                $polName = $matches[1]
                $expectedHash = $matches[2].ToLower()
                $targetPath = Join-Path $afDir $polName
                if (Test-Path $targetPath) {
                    $actualHash = (Get-FileHash -Path $targetPath -Algorithm SHA256).Hash.ToLower()
                    if ($actualHash -ne $expectedHash) {
                        Add-Error $targetPath "policy file hash mismatch! Modified without approved rule-change"
                    }
                }
            }
        }
    }
}

function Test-Coverage($afDir) {
    $reqIds = [System.Collections.Generic.HashSet[string]]::new()
    $ticketReqs = @{}

    $rdir = Join-Path $afDir "requirements"
    if (Test-Path $rdir -PathType Container) {
        Get-ChildItem -Path $rdir -Filter "*.md" | ForEach-Object {
            $fm = Parse-FrontMatter $_.FullName
            if (-not $fm.Error -and @("delivered", "descoped", "dropped", "deprecated") -notcontains [string]$fm.Meta["status"].ToLower()) {
                if ($fm.Meta.ContainsKey("id")) { [void]$reqIds.Add([string]$fm.Meta["id"]) }
            }
        }
    }

    $tdir = Join-Path $afDir "tickets"
    if (Test-Path $tdir -PathType Container) {
        Get-ChildItem -Path $tdir -Filter "*.md" | ForEach-Object {
            $fm = Parse-FrontMatter $_.FullName
            $links = $fm.Meta["req_links"]
            if ($links -is [System.Collections.IList]) {
                $ticketReqs[$_.Name] = [string[]]$links
            } elseif ($links) {
                $ticketReqs[$_.Name] = @([string]$links)
            }
        }
    }

    $covered = [System.Collections.Generic.HashSet[string]]::new()
    foreach ($entry in $ticketReqs.GetEnumerator()) {
        $tname = $entry.Key
        $reqs = $entry.Value
        if (-not $reqs -or $reqs.Length -eq 0) {
            Add-Error (Join-Path $tdir $tname) "orphan ticket: ticket has no req_links (§S3)"
        } else {
            foreach ($r in $reqs) {
                if ($r -and $r -ne "none") { [void]$covered.Add($r) }
            }
        }
    }

    foreach ($r in $reqIds) {
        if (-not $covered.Contains($r)) {
            Add-Error (Join-Path $afDir "requirements") "orphan requirement: $r maps to no ticket (§S3)"
        }
    }
}

# ---------------------------------------------------------------- Seal & SelfCheck

function Write-PolicySeal($afDir) {
    $baseDir = Join-Path $afDir "baselines"
    if (-not (Test-Path $baseDir)) { New-Item -Path $baseDir -ItemType Directory -Force | Out-Null }
    $sealPath = Join-Path $baseDir "policy-seal.md"
    $now = Get-NowCompact

    $lines = @(
        "---",
        "type: baseline",
        "id: B-0000-policy-seal",
        "project_id: tooling-seal",
        "schema_version: 1.0.0",
        "created: $now",
        "actor: validator",
        "role: agent",
        "ticket_id: none",
        "tree_status: clean",
        "---",
        "",
        "# Policy file hash seal",
        "",
        "<!-- Tooling seal: hashes only, never project data. -->",
        ""
    )

    foreach ($pol in @("project.md", "gates.md", "lanes.md", "safety.md", "protected.md", "workflow-map.md")) {
        $p = Join-Path $afDir $pol
        if (Test-Path $p) {
            $hash = (Get-FileHash -Path $p -Algorithm SHA256).Hash.ToLower()
            $lines += "- $pol`: sha256:$hash"
        }
    }
    $lines += ""
    $lines -join "`n" | Set-Content -Path $sealPath -Encoding UTF8
    Add-Note "sealed policy hashes into baselines/policy-seal.md"
}

function Run-SelfCheck {
    $sample = @"
---
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
body
"@
    $res = Parse-FrontMatterContent $sample
    if ($res.Error -or $res.Meta["id"] -ne "T-x4kq-login" -or $res.Meta["req_links"].Count -ne 1) {
        Add-Error "<selfcheck>" "front-matter parser failed: $($res.Error)"
        return
    }
    if ("20261115T093000Z" -match $TS_PATTERN -and "T-x4kq-login" -match $ID_PATTERN) {
        Add-Note "selfcheck passed: parser, timestamp, and id regexes OK"
    } else {
        Add-Error "<selfcheck>" "regex selfcheck failed"
    }
}

# ---------------------------------------------------------------- Execution

if ($SelfCheck) {
    Run-SelfCheck
} else {
    $resolved = Resolve-AfPaths $Path
    $root = $resolved.Root
    $afDir = $resolved.AfDir

    if (-not (Test-Path $afDir -PathType Container)) {
        Add-Error $root "no .agentflow/ directory found at $afDir — run /af-start first"
    } else {
        $projFile = Join-Path $afDir "project.md"
        $projMeta = (Parse-FrontMatter $projFile).Meta
        $projectId = [string]$projMeta["project_id"]
        if (-not $projectId -or $projectId.StartsWith("<")) {
            Add-Warn $projFile "project_id not configured yet (placeholder '$projectId')"
            $projectId = ""
        }

        $suites = ($Check -split ",").ForEach({ $_.Trim().ToLower() })
        $runAll = $suites -contains "all"

        if ($runAll -or $suites -contains "frontmatter") {
            $count = 0
            foreach ($dir in $RECORD_DIRS.Values | Select-Object -Unique) {
                $sub = Join-Path $afDir $dir
                if (Test-Path $sub -PathType Container) {
                    Get-ChildItem -Path $sub -Filter "*.md" | ForEach-Object {
                        $count++
                        Test-RecordFile $_.FullName $projectId | Out-Null
                    }
                }
            }
            Add-Note "scanned $count record files for frontmatter and schema compliance"
        }

        if ($runAll -or $suites -contains "secrets") {
            foreach ($dir in $RECORD_DIRS.Values | Select-Object -Unique) {
                $sub = Join-Path $afDir $dir
                if (Test-Path $sub -PathType Container) {
                    Get-ChildItem -Path $sub -Include "*.md", "*.txt", "*.json", "*.log" | ForEach-Object {
                        Test-SecretsInFile $_.FullName
                    }
                }
            }
        }

        if ($runAll -or $suites -contains "gates") {
            $statuses = Get-LatestTicketStatuses $afDir
            Test-DoneEvidence $afDir $statuses
            Test-ClaimsEvidence $afDir
            Test-StateFreshness $afDir
        }

        if ($runAll -or $suites -contains "manifest") {
            Test-ManifestOverlaps $afDir
        }

        if ($runAll -or $suites -contains "policy") {
            Test-PolicyChecksums $afDir
        }

        if ($runAll -or $suites -contains "coverage") {
            Test-Coverage $afDir
        }

        if ($Seal) {
            Write-PolicySeal $afDir
        }
    }
}

# ---------------------------------------------------------------- Output & Exit

if ($Json) {
    [PSCustomObject]@{
        errors = $Report.Errors
        warnings = $Report.Warnings
        notes = $Report.Notes
        exit = $(if ($Report.Errors.Count -eq 0) { 0 } else { 1 })
    } | ConvertTo-Json -Depth 4
} else {
    foreach ($e in $Report.Errors) { Write-Host "ERROR  $e" -ForegroundColor Red }
    foreach ($w in $Report.Warnings) { Write-Host "WARN   $w" -ForegroundColor Yellow }
    foreach ($n in $Report.Notes) { Write-Host "note   $n" -ForegroundColor Cyan }
    $resLabel = if ($Report.Errors.Count -gt 0) { "FAIL" } elseif ($Report.Warnings.Count -gt 0) { "PASS with warnings" } else { "PASS" }
    $code = if ($Report.Errors.Count -eq 0) { 0 } else { 1 }
    Write-Host "result: $resLabel (exit $code)"
}

exit $(if ($Report.Errors.Count -eq 0) { 0 } else { 1 })
