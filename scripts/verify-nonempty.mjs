#!/usr/bin/env node
/**
 * Fail the build if critical Netlify function sources or root package.json are empty.
 * (Empty files have caused EJSONPARSE, import-is-undefined, and runtime 502s.)
 */
import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".netlify") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (st.size === 0 && name.endsWith(".mjs")) acc.push(p);
  }
}

const bad = [];
walk(join(repoRoot, "netlify", "functions"), bad);

const pkg = join(repoRoot, "package.json");
if (statSync(pkg).size === 0) bad.push(pkg);

if (bad.length) {
  console.error("verify-nonempty: empty files (fix before deploy):\n", bad.join("\n"));
  process.exit(1);
}
console.log("verify-nonempty: ok");
