#!/usr/bin/env node
/**
 * Agentflow question loop — tools/agentflow-loop.js
 *
 * Scans <project>/.agentflow/questions/ for blocking questions that have no
 * verbatim answer yet, prompts the developer one at a time via the terminal,
 * writes each answer verbatim into the question record, logs an answer event,
 * and repeats until zero open blocking questions remain.
 *
 * Usage: node tools/agentflow-loop.js <project>
 */

"use strict";

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execFileSync } = require("child_process");

const PYTHON = "C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
const BASE32_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz"; // no i, l, o, u

function compactNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const pad3 = (n) => String(n).padStart(3, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function base32(n) {
  let s = "";
  do {
    s = BASE32_ALPHABET[n % 32] + s;
    n = Math.floor(n / 32);
  } while (n > 0);
  return s.padStart(4, "0");
}

function randomId() {
  const bytes = new Uint8Array(2);
  crypto.getRandomValues(bytes);
  return base32((bytes[0] << 8) | bytes[1]);
}

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
  return { frontMatter, body, text };
}

function writeRecord(filePath, frontMatter, body) {
  const fmLines = Object.entries(frontMatter).map(([k, v]) => `${k}: ${v}`);
  fs.writeFileSync(filePath, `---\n${fmLines.join("\n")}\n---\n${body}`, "utf8");
}

function setVerbatimAnswer(filePath, answer) {
  const rec = parseRecord(filePath);
  const header = "## Verbatim answer";
  const idx = rec.body.indexOf(header);
  if (idx === -1) {
    rec.body += `\n\n${header}\n"${answer}"\n`;
  } else {
    const after = rec.body.slice(idx + header.length);
    const endMarker = after.match(/\r?\n## /);
    const end = endMarker ? idx + header.length + endMarker.index : rec.body.length;
    rec.body = rec.body.slice(0, idx + header.length) + `\n"${answer}"` + rec.body.slice(end);
  }
  writeRecord(filePath, rec.frontMatter, rec.body);
}

function findOpenBlockingQuestions(qDir) {
  const open = [];
  if (!fs.existsSync(qDir)) return open;
  for (const f of fs.readdirSync(qDir)) {
    if (!f.endsWith(".md")) continue;
    const rec = parseRecord(path.join(qDir, f));
    if (rec.frontMatter.blocking === "true" && !rec.body.includes('## Verbatim answer')) {
      open.push({ file: f, path: path.join(qDir, f), ...rec });
    }
  }
  return open;
}

function writeAnswerEvent(afDir, questionId, answer) {
  const eventsDir = path.join(afDir, "events");
  fs.mkdirSync(eventsDir, { recursive: true });
  const id = `E-${randomId()}-answer-${questionId}`;
  const fileName = `${compactNow()}-none-question-answered-${id}.md`;
  const content = `---\ntype: event\nid: ${id}\nproject_id: ${recProjectId(afDir)}\nschema_version: 1.0.0\ncreated: ${compactNow()}\nactor: owner\nrole: owner\nevent_type: question-answered\nticket_id: none\nsummary: Owner answered blocking question ${questionId}\n---\n\n# Question answered: ${questionId}\n\nAnswer: "${answer}"\n`;
  fs.writeFileSync(path.join(eventsDir, fileName), content, "utf8");
}

function recProjectId(afDir) {
  const p = path.join(afDir, "project.md");
  if (!fs.existsSync(p)) return "af-prj-unknown";
  const rec = parseRecord(p);
  return rec.frontMatter.project_id || "af-prj-unknown";
}

function run(target) {
  const afDir = path.join(target, ".agentflow");
  const qDir = path.join(afDir, "questions");

  if (!fs.existsSync(afDir)) {
    console.error(`Error: .agentflow/ not found in ${target}. Run 'agentflow install <project>' first.`);
    return Promise.resolve(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  return (async () => {
    let round = 0;
    while (true) {
      const open = findOpenBlockingQuestions(qDir);
      if (open.length === 0) break;
      round++;
      console.log(`\n--- Agentflow question loop, round ${round} ---`);
      console.log(`${open.length} open blocking question(s). Answering the first one now.\n`);

      const q = open[0];
      console.log(`File: .agentflow/questions/${q.file}`);
      console.log(`ID: ${q.frontMatter.id}`);
      console.log(`Category: ${q.frontMatter.category}`);
      console.log(`Question:\n${q.body.trim()}\n`);
      const answer = await ask("Your answer (verbatim, will be recorded): ");

      setVerbatimAnswer(q.path, answer);
      writeAnswerEvent(afDir, q.frontMatter.id, answer);
      console.log(`\nAnswer recorded for ${q.frontMatter.id}. Continuing...\n`);
    }

    rl.close();
    console.log("=== Agentflow question loop complete ===");
    console.log("No open blocking questions remain. The no-coding gate is satisfied.");
    return 0;
  })().catch((err) => {
    console.error("Loop error:", err.message);
    rl.close();
    return 1;
  });
}

module.exports = { run };

if (require.main === module) {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node tools/agentflow-loop.js <project>");
    process.exit(2);
  }
  run(target).then((code) => process.exit(code));
}
