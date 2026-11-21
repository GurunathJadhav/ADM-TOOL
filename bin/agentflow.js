#!/usr/bin/env node
/**
 * Agentflow CLI — Node.js entry point (installable via npx).
 *
 * Wraps the existing Python installer (tools/install.py) and provides the
 * question loop (tools/agentflow-loop.js) and pre-edit gate
 * (tools/agentflow-gate.js). No Python files are modified — this is additive.
 *
 * Usage:
 *   npx github:GurunathJadhav/ADM-TOOL install <project> [--dry-run]
 *   npm install -g github:GurunathJadhav/ADM-TOOL
 *   agentflow install <project>
 *   agentflow loop <project>
 *   agentflow doctor <project> [--skip-questions]
 */

"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const PYTHON = "C:\\Users\\User\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
const ROOT = path.resolve(__dirname, "..");

function runPython(script, args) {
  const result = spawnSync(PYTHON, [script, ...args], {
    encoding: "utf8",
    cwd: ROOT,
    stdio: "inherit",
  });
  return result.status;
}

function printHelp() {
  console.log(`
Agentflow CLI v1.0.0 — Markdown agent-agnostic framework

Usage:
  agentflow install <project> [--dry-run]
  agentflow loop <project>
  agentflow doctor <project> [--skip-questions]
  agentflow help

Commands:
  install   Install Agentflow into <project> (wraps tools/install.py)
  loop      Ask blocking questions until all are answered (tools/agentflow-loop.js)
  doctor    Pre-edit gate: refuse if open blocking questions / unbaselined reqs
            Pass --skip-questions to proceed anyway

Examples:
  agentflow install C:\\Users\\You\\my-app
  agentflow loop C:\\Users\\You\\my-app
  agentflow doctor C:\\Users\\You\\my-app --skip-questions

npx examples (no install needed):
  npx github:GurunathJadhav/ADM-TOOL install <project>
  npx github:GurunathJadhav/ADM-TOOL loop <project>
`);
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    printHelp();
    process.exit(0);
  }

  const target = args[1];
  const skip = args.includes("--skip-questions");
  const dryRun = args.includes("--dry-run");

  switch (cmd) {
    case "install":
      if (!target) {
        console.error("Error: install requires a target project path.");
        console.error("Usage: agentflow install <project> [--dry-run]");
        process.exit(2);
      }
      const installArgs = [target];
      if (dryRun) installArgs.push("--dry-run");
      process.exit(runPython(path.join(ROOT, "tools", "install.py"), installArgs) || 0);
      break;

    case "loop":
      if (!target) {
        console.error("Error: loop requires a target project path.");
        console.error("Usage: agentflow loop <project>");
        process.exit(2);
      }
      process.exit(require(path.join(ROOT, "tools", "agentflow-loop.js")).run(target));
      break;

    case "doctor":
      if (!target) {
        console.error("Error: doctor requires a target project path.");
        console.error("Usage: agentflow doctor <project> [--skip-questions]");
        process.exit(2);
      }
      process.exit(require(path.join(ROOT, "tools", "agentflow-gate.js")).run(target, skip));
      break;

    default:
      console.error(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(2);
  }
}

main();
