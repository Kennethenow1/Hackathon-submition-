/**
 * Netlify Dev runs the dev command in an environment where `npm` / `bash`
 * may not be on PATH. This file is started with an absolute `node` path;
 * It cds to the monorepo root and execs npm (same Node as `process.execPath`, or nvm fallback).
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const nodeBin = process.execPath;
const npmCli = path.join(path.dirname(nodeBin), "npm");
const fallbackNpm =
  "/home/kenneth-enow/.nvm/versions/node/v20.19.5/bin/npm";

const npmPath = existsSync(npmCli) ? npmCli : fallbackNpm;

process.chdir(repoRoot);

const child = spawn(npmPath, ["run", "dev", "--workspace=web"], {
  cwd: repoRoot,
  stdio: "inherit",
  env: process.env,
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
