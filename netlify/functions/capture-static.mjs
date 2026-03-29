import * as cheerio from "cheerio";
import { assertSafeHttpUrl, fetchSafe } from "./lib/url-guard.mjs";
import { corsHeaders } from "./lib/cors.mjs";
import { netlifyHttpMethod, netlifyRawBody } from "./lib/runtime.mjs";

const MAX_HTML_BYTES = 2_000_000;
const MAX_TOTAL_CSS_BYTES = 3_000_000;
const MAX_SINGLE_CSS_BYTES = 1_200_000;
const FETCH_MS = 25_000;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(),
    },
    body: JSON.stringify(body),
  };
}

/**
 * @param {string} pageUrl
 * @param {string} href
 */
function resolveHref(pageUrl, href) {
  if (!href || href.startsWith("data:") || href.startsWith("blob:")) {
    return null;
  }
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return null;
  }
}

async function handleRequest(event) {
  const method = netlifyHttpMethod(event);

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  if (method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  let payload;
  try {
    payload = JSON.parse(netlifyRawBody(event) || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body" });
  }

  const url = typeof payload.url === "string" ? payload.url.trim() : "";
  if (!url) {
    return json(400, { ok: false, error: "Missing url" });
  }

  let pageUrl;
  try {
    pageUrl = assertSafeHttpUrl(url).href;
  } catch (e) {
    return json(400, { ok: false, error: e instanceof Error ? e.message : "Bad URL" });
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_MS);

  let htmlRes;
  try {
    htmlRes = await fetchSafe(pageUrl, {
      signal: ac.signal,
      headers: { Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8" },
    });
  } catch (e) {
    clearTimeout(timer);
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return json(502, { ok: false, error: msg });
  } finally {
    clearTimeout(timer);
  }

  if (!htmlRes.ok) {
    return json(502, {
      ok: false,
      error: `Primary fetch failed: HTTP ${htmlRes.status}`,
    });
  }

  const ct = htmlRes.headers.get("content-type") || "";
  if (!/text\/html|application\/xhtml\+xml/i.test(ct)) {
    return json(415, {
      ok: false,
      error: `Expected HTML, got content-type: ${ct || "unknown"}`,
    });
  }

  const buf = new Uint8Array(await htmlRes.arrayBuffer());
  if (buf.byteLength > MAX_HTML_BYTES) {
    return json(413, {
      ok: false,
      error: `HTML exceeds limit (${MAX_HTML_BYTES} bytes)`,
    });
  }

  const html = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  let $;
  try {
    $ = cheerio.load(html);
  } catch (e) {
    return json(500, {
      ok: false,
      error: e instanceof Error ? e.message : "HTML parse failed",
      code: "CHEERIO_LOAD",
    });
  }

  const stylesheets = [];
  let cssTotal = 0;
  const warnings = [];

  const linkEls = $('link[rel="stylesheet"], link[rel="preload"][as="style"]');
  for (const el of linkEls.toArray()) {
    const href = $(el).attr("href");
    const resolved = resolveHref(pageUrl, href || "");
    if (!resolved) continue;

    try {
      assertSafeHttpUrl(resolved);
    } catch (e) {
      warnings.push({
        href: resolved,
        skipped: e instanceof Error ? e.message : "Blocked URL",
      });
      continue;
    }

    const cssAc = new AbortController();
    const cssTimer = setTimeout(() => cssAc.abort(), FETCH_MS);
    let cssRes;
    try {
      cssRes = await fetchSafe(resolved, {
        signal: cssAc.signal,
        headers: { Accept: "text/css,*/*;q=0.8" },
      });
    } catch (e) {
      clearTimeout(cssTimer);
      warnings.push({
        href: resolved,
        error: e instanceof Error ? e.message : "CSS fetch failed",
      });
      continue;
    } finally {
      clearTimeout(cssTimer);
    }

    if (!cssRes.ok) {
      warnings.push({ href: resolved, error: `HTTP ${cssRes.status}` });
      continue;
    }

    const cssBuf = new Uint8Array(await cssRes.arrayBuffer());
    if (cssBuf.byteLength > MAX_SINGLE_CSS_BYTES) {
      warnings.push({ href: resolved, error: "CSS file too large" });
      continue;
    }
    if (cssTotal + cssBuf.byteLength > MAX_TOTAL_CSS_BYTES) {
      warnings.push({ href: resolved, error: "Total CSS budget exceeded" });
      break;
    }

    const cssText = new TextDecoder("utf-8", { fatal: false }).decode(cssBuf);
    cssTotal += cssBuf.byteLength;
    stylesheets.push({
      href: resolved,
      css: cssText,
      bytes: cssBuf.byteLength,
    });
  }

  const inlineStyles = $("style")
    .toArray()
    .map((el) => $(el).html() || "")
    .filter(Boolean);

  return json(200, {
    ok: true,
    mode: "static",
    pageUrl,
    html,
    stylesheets,
    inlineStyles,
    warnings,
    meta: {
      htmlBytes: buf.byteLength,
      stylesheetCount: stylesheets.length,
      inlineStyleTagCount: inlineStyles.length,
    },
  });
}

export async function handler(event) {
  try {
    return await handleRequest(event);
  } catch (err) {
    console.error("[capture-static]", err);
    return json(500, {
      ok: false,
      error: err instanceof Error ? err.message : "Internal error",
      code: "UNHANDLED",
    });
  }
}
