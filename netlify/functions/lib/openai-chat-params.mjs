/**
 * GPT-5 family chat completions:
 * - Reject custom `temperature` (only default 1) — omit it.
 * - Reject `max_tokens` — use `max_completion_tokens` instead.
 */
export function chatCompletionBody(model, body) {
  const id = typeof model === "string" ? model : "";
  if (!/^gpt-5/i.test(id)) {
    return body;
  }
  const { temperature: _t, max_tokens: maxTokens, ...rest } = body;
  const out = { ...rest };
  if (maxTokens != null) {
    out.max_completion_tokens = maxTokens;
  }
  return out;
}
