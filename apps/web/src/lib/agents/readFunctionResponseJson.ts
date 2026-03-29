/**
 * Netlify-style functions sometimes return an empty body (proxy down, timeout, misconfigured handler).
 * Never call `response.json()` blindly — it throws on "".
 */
export async function readFunctionResponseJson(
  res: Response
): Promise<
  | { ok: true; data: unknown }
  | { ok: false; reason: "empty" | "not_json"; status: number; snippet: string }
> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty", status: res.status, snippet: "" };
  }
  try {
    return { ok: true, data: JSON.parse(trimmed) };
  } catch {
    return {
      ok: false,
      reason: "not_json",
      status: res.status,
      snippet: trimmed.slice(0, 400),
    };
  }
}
