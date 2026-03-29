import type { RenderedCaptureResponse, StaticCaptureResponse } from "../../types/capture";

const FUNCTIONS_BASE = "/.netlify/functions";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${FUNCTIONS_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, error: "Server returned non-JSON" } as T;
  }
  if (
    !res.ok &&
    data &&
    typeof data === "object" &&
    "ok" in data &&
    (data as { ok: boolean }).ok === false
  ) {
    return data as T;
  }
  if (!res.ok) {
    return { ok: false, error: `HTTP ${res.status}` } as T;
  }
  return data as T;
}

export function captureStatic(url: string) {
  return postJson<StaticCaptureResponse>("/capture-static", { url });
}

export function captureRendered(url: string) {
  return postJson<RenderedCaptureResponse>("/capture-rendered", { url });
}
