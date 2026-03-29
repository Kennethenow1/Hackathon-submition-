#!/usr/bin/env node
/**
 * Lightweight local dev server for Netlify-style functions.
 * Bypasses `netlify functions:serve` which has issues with monorepo
 * workspaces, ESM/CJS detection, and PATH checks.
 *
 * Usage:  node scripts/serve-functions.mjs [--port 9999]
 */
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const functionsDir = path.join(repoRoot, "netlify", "functions");

/** Load repo-root `.env` without overriding variables already set in the shell. */
function loadRootEnv(root) {
  const fp = path.join(root, ".env");
  if (!existsSync(fp)) return;
  const text = readFileSync(fp, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    if (!key || key.includes(" ")) continue;
    if (Object.prototype.hasOwnProperty.call(process.env, key) && process.env[key] !== "")
      continue;
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadRootEnv(repoRoot);

const PORT = parseInt(process.argv.includes("--port")
  ? process.argv[process.argv.indexOf("--port") + 1]
  : "9999", 10);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const loaded = new Map();

async function loadHandler(name) {
  if (loaded.has(name)) return loaded.get(name);
  const fp = path.join(functionsDir, `${name}.mjs`);
  try {
    const mod = await import(fp);
    loaded.set(name, mod.handler);
    console.log(`  loaded: ${name}`);
    return mod.handler;
  } catch (e) {
    console.error(`  failed to load ${name}:`, e.message);
    return null;
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const prefix = "/.netlify/functions/";
  if (!req.url?.startsWith(prefix)) {
    res.writeHead(404, CORS);
    res.end(JSON.stringify({ ok: false, error: "Not a function path" }));
    return;
  }

  const fnName = req.url.slice(prefix.length).split("?")[0];

  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    res.end();
    return;
  }

  const handler = await loadHandler(fnName);
  if (!handler) {
    res.writeHead(404, { "Content-Type": "application/json", ...CORS });
    res.end(JSON.stringify({ ok: false, error: `Function "${fnName}" not found` }));
    return;
  }

  const body = await readBody(req);

  const event = {
    httpMethod: req.method?.toUpperCase() ?? "GET",
    headers: req.headers,
    body,
    isBase64Encoded: false,
    path: req.url,
    queryStringParameters: {},
  };

  try {
    const result = await handler(event);
    const headers = { ...CORS, ...(result.headers || {}) };
    const status = result.statusCode || 200;

    if (status === 204) {
      res.writeHead(204, headers);
      res.end();
      return;
    }

    const rawBody = result.body;
    const bodyStr =
      typeof rawBody === "string" && rawBody.length > 0
        ? rawBody
        : JSON.stringify({
            ok: false,
            error:
              "Function returned an empty body. Check the function logs or handler return value.",
            code: "empty_function_body",
          });

    if (!headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }

    res.writeHead(status, headers);
    res.end(bodyStr);
  } catch (e) {
    console.error(`  [${fnName}] unhandled:`, e);
    res.writeHead(500, { "Content-Type": "application/json", ...CORS });
    res.end(JSON.stringify({ ok: false, error: e.message || "Internal error" }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n  Functions server ready on http://127.0.0.1:${PORT}`);
  console.log(`  Serving from: ${functionsDir}\n`);
});
