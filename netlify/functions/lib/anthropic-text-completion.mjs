import Anthropic from "@anthropic-ai/sdk";
import { withAnthropicRetry } from "./anthropic-retry.mjs";

/**
 * One-shot text completion (e.g. JSON-only Remotion coding agent output).
 * Uses streaming (`messages.stream` → `finalMessage()`) so long generations stay within API guidance (>~10m).
 * @param {{
 *   apiKey: string;
 *   model: string;
 *   system: string;
 *   userText: string;
 *   maxOutputTokens: number;
 * }} opts
 * @returns {Promise<{ text: string; stopReason: string | null; model: string }>}
 */
export async function anthropicCompleteText(opts) {
  const { apiKey, model, system, userText, maxOutputTokens } = opts;
  const client = new Anthropic({ apiKey });
  const response = await withAnthropicRetry(
    () =>
      client.messages
        .stream({
          model,
          max_tokens: maxOutputTokens,
          system,
          messages: [{ role: "user", content: userText }],
        })
        .finalMessage(),
    { label: "anthropic-text-completion", maxAttempts: 6 }
  );
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  return {
    text,
    stopReason: response.stop_reason ?? null,
    model,
  };
}
