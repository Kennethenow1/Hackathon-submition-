/**
 * Retry OpenAI calls on 429 rate limits. Parses "try again in Xs" from the error message
 * when present; otherwise exponential backoff with jitter.
 */

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** @param {string} [message] */
export function parseRetryAfterSecondsFromMessage(message) {
  if (!message) return null;
  const m = /try again in ([\d.]+)\s*s/i.exec(message);
  if (!m) return null;
  const sec = Number.parseFloat(m[1]);
  if (!Number.isFinite(sec) || sec < 0) return null;
  return Math.min(120, Math.ceil(sec + 0.5));
}

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @param {{ maxAttempts?: number; label?: string }} [opts]
 * @returns {Promise<T>}
 */
export async function withOpenAiRateLimitRetry(fn, opts = {}) {
  const maxAttempts = opts.maxAttempts ?? 8;
  const label = opts.label ?? "openai";
  let lastErr;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const status = e?.status ?? e?.response?.status;
      const msg = typeof e?.message === "string" ? e.message : String(e);
      const is429 =
        status === 429 ||
        /429|rate\s*limit|tokens per min|TPM/i.test(msg);

      if (!is429 || attempt === maxAttempts - 1) {
        throw e;
      }

      const fromApi = parseRetryAfterSecondsFromMessage(msg);
      const backoffMs = Math.min(90_000, 1500 * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 400);
      const waitMs = fromApi != null ? fromApi * 1000 + jitter : backoffMs + jitter;

      console.warn(
        `[${label}] OpenAI rate limit (429), attempt ${attempt + 1}/${maxAttempts}, waiting ${Math.round(waitMs)}ms`
      );
      await sleep(waitMs);
    }
  }

  throw lastErr;
}
