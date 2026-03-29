import type {
  GeneratingAgentRequestBody,
  GeneratingAgentResponse,
} from "../../types/generating-artifact";
import { readFunctionResponseJson } from "./readFunctionResponseJson";

/** Tool names mirrored by `netlify/functions/generating-agent.mjs` (for UI/docs). */
export const GENERATING_AGENT_TOOL_NAMES = [
  "get_bundle_metadata",
  "get_user_vision_and_effects",
  "get_navigation_md",
  "get_site_html_slice",
  "get_site_css_slice",
  "get_site_js_slice",
  "submit_generating_outputs",
] as const;

const FUNCTIONS_PATH = "/.netlify/functions/generating-agent";

export async function runGeneratingAgent(
  body: GeneratingAgentRequestBody
): Promise<GeneratingAgentResponse> {
  const res = await fetch(FUNCTIONS_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const parsed = await readFunctionResponseJson(res);

  if (!parsed.ok) {
    if (parsed.reason === "empty") {
      return {
        ok: false,
        error:
          `Empty response (HTTP ${parsed.status}). Start functions on port 9999 (\`npm run dev\` or \`npm run dev:functions\`).`,
        code: "empty_response",
      };
    }
    return {
      ok: false,
      error: `Not JSON (HTTP ${parsed.status}): ${parsed.snippet || ""}`,
      code: "invalid_json",
    };
  }

  const data = parsed.data as GeneratingAgentResponse;

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
