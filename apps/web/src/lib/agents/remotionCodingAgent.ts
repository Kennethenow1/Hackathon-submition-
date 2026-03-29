import type {
  RemotionCodingRequestBody,
  RemotionCodingResponse,
} from "../../types/remotion-coding-artifact";
import { postNetlifyFunction } from "./postNetlifyFunction";
import { readFunctionResponseJson } from "./readFunctionResponseJson";

const FUNCTIONS_PATH = "/.netlify/functions/remotion-coding-agent";

export async function runRemotionCodingAgent(
  body: RemotionCodingRequestBody
): Promise<RemotionCodingResponse> {
  const posted = await postNetlifyFunction(FUNCTIONS_PATH, body);
  if (!posted.ok) {
    return { ok: false, error: posted.error, code: "fetch_failed" };
  }
  const res = posted.res;

  const parsed = await readFunctionResponseJson(res);

  if (!parsed.ok) {
    if (parsed.reason === "empty") {
      return {
        ok: false,
        error:
          `Empty response (HTTP ${parsed.status}). Is the functions server running? From the repo root run \`npm run dev\` (starts port 9999 + Vite) or \`npm run dev:functions\`, then open the Vite URL so /.netlify/functions proxies correctly.`,
        code: "empty_response",
      };
    }
    return {
      ok: false,
      error: `Not JSON (HTTP ${parsed.status}): ${parsed.snippet || "(no body)"}`,
      code: "invalid_json",
    };
  }

  const data = parsed.data as RemotionCodingResponse;

  if (!data || typeof data !== "object") {
    return {
      ok: false,
      error: "Malformed function response",
      code: "malformed",
    };
  }

  if (!res.ok && !("ok" in data)) {
    return {
      ok: false,
      error: res.statusText || `HTTP ${res.status}`,
      code: "http_error",
    };
  }

  return data;
}
