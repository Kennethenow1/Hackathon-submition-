function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Transient Anthropic errors we should backoff-retry (rate limits, API overload, some 5xx).
 * @param {unknown} err
 * @returns {boolean}
 */
function isAnthropicRetriableError(err) {
  const status = err?.status ?? err?.response?.status;
  const msg = typeof err?.message === "string" ? err.message : String(err);
  if (status === 429 || status === 529) return true;
  if (/429|rate limit|overloaded|529/i.test(msg)) return true;
  try {
    const blob = JSON.stringify(err?.error ?? err);
    if (/overloaded_error/i.test(blob)) return true;
  } catch {
    /* ignore */
  }
  return false;
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
      if (!isAnthropicRetriableError(e) || attempt === maxAttempts - 1) throw e;
      const waitMs = Math.min(90_000, 2500 * 2 ** attempt) + Math.floor(Math.random() * 800);
      console.warn(
        `[${label}] Anthropic transient error (rate limit / overload), attempt ${attempt + 1}/${maxAttempts}, wait ${waitMs}ms`
      );
      await sleep(waitMs);
    }
  }
  throw lastErr;
}
