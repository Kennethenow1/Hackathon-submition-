/**
 * POST JSON to a Netlify-style function path (proxied to port 9999 in dev).
 */
export async function postNetlifyFunction(
  path: string,
  body: unknown,
  opts?: { timeoutMs?: number }
): Promise<{ ok: true; res: Response } | { ok: false; error: string }> {
  const timeoutMs = Math.max(1_000, opts?.timeoutMs ?? 300_000);
  const ac = new AbortController();
  const timeout = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ac.signal,
    });
    return { ok: true, res };
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return {
        ok: false,
        error:
          `Request timed out after ${Math.round(timeoutMs / 1000)}s: ${path}. ` +
          "Make sure local functions are running on :9999 and check the function terminal logs.",
      };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    clearTimeout(timeout);
  }
}

/** GET (e.g. ambient catalog). */
export async function getNetlifyFunction(
  path: string
): Promise<{ ok: true; res: Response } | { ok: false; error: string }> {
  try {
    const res = await fetch(path);
    return { ok: true, res };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
