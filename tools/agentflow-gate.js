#!/usr/bin/env node
/**
 * Agentflow pre-edit gate — tools/agentflow-gate.js
 *
 * Refuses to proceed if any blocking question is unanswered or any requirement
 * is not baselined, unless --skip-questions is passed. Also rejects manifests
 * that carry questions_closed: false.
 *
 * Usage: node tools/agentflow-gate.js <project> [--skip-questions]
 * Exit 0 = clear to edit. Exit 1 = blocked.
 */

"use strict";

const fs = require("fs");
const path = require("path");

function parseRecord(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  let frontMatter = {};
  let body = text;
  const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (fmMatch) {
    const lines = fmMatch[1].split("\n");
    for (const line of lines) {
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if (m) frontMatter[m[1].trim()] = m[2].trim();
    }
    body = fmMatch[2];
  }
  return { frontMatter, body };
}

function findOpenBlockingQuestions(qDir) {
  const open = [];
  if (!fs.existsSync(qDir)) return open;
  for (const f of fs.readdirSync(qDir)) {
    if (!f.endsWith(".md")) continue;
    const rec = parseRecord(path.join(qDir, f));
    if (rec.frontMatter.blocking === "true" && !rec.body.includes('## Verbatim answer')) {
      open.push(`${rec.frontMatter.id || f} — ${rec.frontMatter.category || "uncategorized"}`);
    }
  }
  return open;
}

function findUnbaselinedRequirements(rDir) {
  const unbased = [];
  if (!fs.existsSync(rDir)) return unbased;
  for (const f of fs.readdirSync(rDir)) {
    if (!f.endsWith(".md")) continue;
    const rec = parseRecord(path.join(rDir, f));
    if (rec.frontMatter.status !== "baselined") {
      unbased.push(`${rec.frontMatter.id || f} — status: ${rec.frontMatter.status || "unset"}`);
    }
  }
  return unbased;
}

function findBadManifests(mDir) {
  const bad = [];
  if (!fs.existsSync(mDir)) return bad;
  for (const f of fs.readdirSync(mDir)) {
    if (!f.endsWith(".md")) continue;
    const rec = parseRecord(path.join(mDir, f));
    if (rec.frontMatter.questions_closed === "false") {
      bad.push(`${rec.frontMatter.id || f} — questions_closed: false`);
    }
  }
  return bad;
}

function run(target, skipQuestions) {
  const afDir = path.join(target, ".agentflow");
  const qDir = path.join(afDir, "questions");
  const rDir = path.join(afDir, "requirements");
  const mDir = path.join(afDir, "manifests");

  const openQuestions = findOpenBlockingQuestions(qDir);
  const unbasedReqs = findUnbaselinedRequirements(rDir);
  const badManifests = findBadManifests(mDir);

  const blocked = openQuestions.length > 0 || unbasedReqs.length > 0 || badManifests.length > 0;

  if (!blocked) {
    console.log("Agentflow gate: CLEAR — no open blocking questions, all requirements baselined, manifests closed.");
    return 0;
  }

  if (skipQuestions) {
    console.warn("Agentflow gate: BLOCKED but proceeding (--skip-questions passed).");
    if (openQuestions.length) console.warn(`  Open blocking questions: ${openQuestions.join("; ")}`);
    if (unbasedReqs.length) console.warn(`  Unbaselined requirements: ${unbasedReqs.join("; ")}`);
    if (badManifests.length) console.warn(`  Manifests not closed: ${badManifests.join("; ")}`);
    return 0;
  }

  console.error("Agentflow gate: BLOCKED — agent must not start coding yet.");
  if (openQuestions.length) {
    console.error("\nOpen blocking questions (answer them with 'agentflow loop' first):");
    for (const q of openQuestions) console.error(`  - ${q}`);
  }
  if (unbasedReqs.length) {
    console.error("\nRequirements not yet baselined:");
    for (const r of unbasedReqs) console.error(`  - ${r}`);
  }
  if (badManifests.length) {
    console.error("\nManifests with open questions:");
    for (const m of badManifests) console.error(`  - ${m}`);
  }
  console.error("\nRun: agentflow loop <project>   (to close questions)");
  console.error("Or:  agentflow doctor <project> --skip-questions   (developer override)");
  return 1;
}

module.exports = { run };

if (require.main === module) {
  const target = process.argv[2];
  const skip = process.argv.includes("--skip-questions");
  if (!target) {
    console.error("Usage: node tools/agentflow-gate.js <project> [--skip-questions]");
    process.exit(2);
  }
  process.exit(run(target, skip));
}
