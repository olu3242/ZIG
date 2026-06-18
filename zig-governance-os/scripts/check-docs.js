#!/usr/bin/env node
/**
 * Walks docs/ and reports which files still carry the "STATUS: STUB" marker.
 * Used by `npm run docs:lint`. This exists so the documentation-first rule in
 * CLAUDE.md is checkable, not just a guideline nobody verifies.
 */
const fs = require("fs");
const path = require("path");

const DOCS_DIR = path.join(__dirname, "..", "docs");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

const files = walk(DOCS_DIR);
const stubs = [];
const done = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(path.join(__dirname, ".."), file);
  if (content.includes("STATUS: STUB")) stubs.push(rel);
  else done.push(rel);
}

console.log(`\nZig docs status — ${done.length} written, ${stubs.length} still stubs\n`);

if (stubs.length) {
  console.log("Still STUB (write these before implementing the Fable phase that needs them):");
  for (const s of stubs.sort()) console.log(`  - ${s}`);
}

console.log("\nWritten:");
for (const d of done.sort()) console.log(`  - ${d}`);

console.log("");
