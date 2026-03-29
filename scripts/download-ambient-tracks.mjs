#!/usr/bin/env node
/**
 * Downloads ambient MP3s listed in apps/web/public/ambient/catalog.json
 * into apps/web/public/ambient/files/ (for offline render without fetching URLs).
 *
 * Usage: node scripts/download-ambient-tracks.mjs
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const catalogPath = path.join(root, "apps", "web", "public", "ambient", "catalog.json");
const outDir = path.join(root, "apps", "web", "public", "ambient", "files");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
mkdirSync(outDir, { recursive: true });

for (const t of catalog.tracks || []) {
  const url = t.downloadUrl;
  const rel = t.file?.replace(/^\//, "") || "";
  if (!url || !rel.startsWith("ambient/files/")) {
    console.warn("skip (missing url/file):", t.id);
    continue;
  }
  const dest = path.join(root, "apps", "web", "public", rel.split("/").join(path.sep));
  if (existsSync(dest) && process.argv.includes("--force") === false) {
    console.log("exists:", rel);
    continue;
  }
  console.log("fetch", t.id, "→", rel);
  const res = await fetch(url, { headers: { "User-Agent": "ai-slop-machine-ambient-download/1.0" } });
  if (!res.ok) {
    console.error(`FAILED ${res.status} ${url}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, buf);
  console.log("wrote", dest, `(${buf.length} bytes)`);
}

console.log("done.");
