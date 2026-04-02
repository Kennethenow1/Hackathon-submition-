import type {
  RemotionRenderPreviewRequestBody,
  RemotionRenderPreviewResponse,
} from "../../types/remotion-coding-artifact";
import { postNetlifyFunction } from "./postNetlifyFunction";
import { readFunctionResponseJson } from "./readFunctionResponseJson";

const FUNCTIONS_PATH = "/.netlify/functions/remotion-render-preview";

export async function runRemotionRenderPreview(
  input: RemotionRenderPreviewRequestBody
): Promise<RemotionRenderPreviewResponse> {
  const posted = await postNetlifyFunction(
    FUNCTIONS_PATH,
    input satisfies RemotionRenderPreviewRequestBody,
    { timeoutMs: 1_900_000 }
  );
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
          `Empty response (HTTP ${parsed.status}). Start functions on port 9999 (\`npm run dev\`).`,
        code: "empty_response",
      };
    }
    return {
      ok: false,
      error: `Not JSON (HTTP ${parsed.status}): ${parsed.snippet || ""}`,
      code: "invalid_json",
    };
  }

  const data = parsed.data as RemotionRenderPreviewResponse;

  if (!data || typeof data !== "object") {
    return {
      ok: false,
      error: "Malformed function response",
      code: "malformed",
    };
  }

  return data;
}
