import path from "node:path";

/**
 * Directory for resolving repo-relative paths. Netlify bundles functions as CJS and
 * injects `__dirname`; using `import.meta.url` breaks under that bundler (empty import.meta).
 * Native ESM without a bundler has no `__dirname` — fall back to cwd.
 */
export function moduleDirname() {
  try {
    // eslint-disable-next-line no-undef -- defined in Netlify's CJS bundle output
    return __dirname;
  } catch {
    return process.cwd();
  }
}

/**
 * Try common repo layouts: bundled function root, netlify/functions/lib, cwd.
 */
export function resolveAgentContextRemotionDir() {
  const { join } = path;
  const moduleDir = moduleDirname();
  const candidates = [
    join(moduleDir, "agent-context", "remotion"),
    join(moduleDir, "..", "..", "..", "agent-context", "remotion"),
    join(process.cwd(), "agent-context", "remotion"),
  ];
  return { candidates };
}
