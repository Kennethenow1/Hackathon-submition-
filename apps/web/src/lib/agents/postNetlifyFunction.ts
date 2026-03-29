/**
 * POST JSON to a Netlify-style function path (proxied to port 9999 in dev).
 */
export async function postNetlifyFunction(
  path: string,
  body: unknown
): Promise<{ ok: true; res: Response } | { ok: false; error: string }> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: true, res };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
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
