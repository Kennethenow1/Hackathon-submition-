/**
 * Extract a JSON object from LLM output that may include markdown fences,
 * preamble/postamble, or partial formatting noise.
 */

import { jsonrepair } from "jsonrepair";

/** Remove BOM / zero-width chars that break JSON.parse */
function normalizeText(s) {
  return String(s || "")
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

/**
 * First ```json ... ``` or ``` ... ``` block (longest inner wins if multiple).
 */
function extractMarkdownFenceInner(text) {
  const re = /```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```/gi;
  let best = null;
  let bestLen = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const inner = m[1].trim();
    if (inner.length >= bestLen) {
      bestLen = inner.length;
      best = inner;
    }
  }
  return best;
}

/**
 * First top-level `{ ... }` balanced for JSON strings (double-quoted only).
 */
function extractFirstBalancedObject(text) {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * @param {string} content - raw model output
 * @returns {{ ok: true, data: object } | { ok: false, error: string, attempts?: string[] }}
 */
export function parseLlmJsonObject(content) {
  const attempts = [];
  let t = normalizeText(content);
  if (!t) {
    return { ok: false, error: "Empty model output", attempts };
  }

  const tryParse = (label, slice) => {
    if (!slice || typeof slice !== "string") {
      attempts.push(`${label}: empty slice`);
      return null;
    }
    const variants = [["raw", slice]];
    try {
      const fixed = jsonrepair(slice);
      if (fixed !== slice) variants.push(["repaired", fixed]);
    } catch {
      /* jsonrepair throws on some inputs; ignore */
    }
    for (const [tag, s] of variants) {
      try {
        const data = JSON.parse(s);
        if (data !== null && typeof data === "object" && !Array.isArray(data)) {
          return { ok: true, data };
        }
        attempts.push(`${label}(${tag}): parsed value is not a JSON object`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        attempts.push(`${label}(${tag}): ${msg}`);
      }
    }
    return null;
  };

  let r = tryParse("direct", t);
  if (r) return r;

  const fenced = extractMarkdownFenceInner(t);
  if (fenced) {
    r = tryParse("markdown_fence", fenced);
    if (r) return r;
    const sub = extractFirstBalancedObject(fenced);
    if (sub && sub !== fenced) {
      r = tryParse("fence+balanced", sub);
      if (r) return r;
    }
  }

  const balanced = extractFirstBalancedObject(t);
  if (balanced) {
    r = tryParse("balanced_brace", balanced);
    if (r) return r;
  }

  const fromBrace = t.indexOf("{");
  if (fromBrace > 0) {
    const tail = t.slice(fromBrace);
    r = tryParse("from_first_brace", tail);
    if (r) return r;
    const bal2 = extractFirstBalancedObject(tail);
    if (bal2) {
      r = tryParse("from_first_brace+balanced", bal2);
      if (r) return r;
    }
  }

  return {
    ok: false,
    error: "Model did not return valid JSON",
    attempts,
  };
}
