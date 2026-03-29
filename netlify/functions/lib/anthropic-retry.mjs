function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * @param {unknown} err
 * @returns {boolean}
 */
function isAnthropicRateLimit(err) {
  const status = err?.status ?? err?.response?.status;
  const msg = typeof err?.message === "string" ? err.message : String(err);
  return status === 429 || /429|rate limit/i.test(msg);
}

/**
 * @param {() => Promise<unknown>} fn
 * @param {{ maxAttempts?: number; label?: string }} [opts]
 */
export async function withAnthropicRetry(fn, opts = {}) {
  const maxAttempts = opts.maxAttempts ?? 6;
  const label = opts.label ?? "anthropic";
  let lastErr;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (!isAnthropicRateLimit(e) || attempt === maxAttempts - 1) throw e;
      const waitMs = Math.min(60_000, 2000 * 2 ** attempt) + Math.floor(Math.random() * 500);
      console.warn(`[${label}] Anthropic rate limit, attempt ${attempt + 1}/${maxAttempts}, wait ${waitMs}ms`);
      await sleep(waitMs);
    }
  }
  throw lastErr;
}
