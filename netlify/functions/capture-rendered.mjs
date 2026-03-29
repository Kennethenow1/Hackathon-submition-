import puppeteer from "puppeteer-core";
import chromiumMod from "@sparticuz/chromium";
import { assertSafeHttpUrl } from "./lib/url-guard.mjs";
import { corsHeaders } from "./lib/cors.mjs";
import { netlifyHttpMethod, netlifyRawBody } from "./lib/runtime.mjs";

const chromium = chromiumMod?.default ?? chromiumMod;

const MAX_HTML_BYTES = 2_500_000;

/** Puppeteer `page.goto` timeout — heavy pages / slow TLS need more than 45s. */
function navigationTimeoutMs() {
  const raw = process.env.CAPTURE_RENDERED_NAVIGATION_TIMEOUT_MS;
  if (raw == null || String(raw).trim() === "") return 120_000;
  const n = Number.parseInt(String(raw), 10);
  if (Number.isFinite(n) && n >= 5_000 && n <= 900_000) return n;
  return 120_000;
}

/** `networkidle2` can hang on SPAs with long-polling; `load` / `domcontentloaded` finish sooner. */
function waitUntilOption() {
  const w = (process.env.CAPTURE_RENDERED_WAIT_UNTIL || "").trim().toLowerCase();
  if (w === "load" || w === "domcontentloaded" || w === "networkidle0" || w === "networkidle2") {
    return w;
  }
  return "networkidle2";
}

const COMPUTED_KEYS = [
  "color",
  "background-color",
  "border-color",
  "fill",
  "stroke",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "display",
  "position",
  "width",
  "height",
  "margin",
  "padding",
  "border-radius",
  "opacity",
  "transform",
  "text-align",
];

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

async function launchBrowser() {
  const local = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (local) {
    return puppeteer.launch({
      executablePath: local,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  }

  if (typeof chromium?.executablePath !== "function") {
    throw new Error("@sparticuz/chromium did not load (check function dependencies install)");
  }

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
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

  let browser;
  try {
    browser = await launchBrowser();
  } catch (e) {
    const onServerless = Boolean(
      process.env.NETLIFY ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.AWS_EXECUTION_ENV
    );
    const hint = onServerless
      ? "Headless Chromium failed on this runtime (check Netlify Node 20 + function memory)."
      : "Install Chrome/Chromium and set PUPPETEER_EXECUTABLE_PATH, or use “Fetch HTML + linked CSS” instead.";
    return json(503, {
      ok: false,
      error: e instanceof Error ? e.message : "Browser launch failed",
      hint,
      code: "BROWSER_LAUNCH",
    });
  }

  const fetchMs = navigationTimeoutMs();
  const waitUntil = waitUntilOption();

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(fetchMs);
  page.setDefaultTimeout(fetchMs);

  try {
    await page.goto(pageUrl, { waitUntil, timeout: fetchMs });
  } catch (e) {
    await browser.close();
    const msg = e instanceof Error ? e.message : "Navigation failed";
    return json(502, {
      ok: false,
      error: msg,
      code: "NAVIGATION_FAILED",
      hint:
        /timeout/i.test(msg)
          ? "Increase CAPTURE_RENDERED_NAVIGATION_TIMEOUT_MS (ms) and ensure the Netlify function timeout for capture-rendered is higher. If the site never reaches network idle (analytics, websockets), set CAPTURE_RENDERED_WAIT_UNTIL=load or domcontentloaded."
          : undefined,
    });
  }

  const html = await page.content();
  const htmlBytes = Buffer.byteLength(html, "utf8");
  if (htmlBytes > MAX_HTML_BYTES) {
    await browser.close();
    return json(413, {
      ok: false,
      error: `Rendered HTML exceeds limit (${MAX_HTML_BYTES} bytes)`,
    });
  }

  const computedSnapshots = await page.evaluate((keys) => {
    const elements = Array.from(document.querySelectorAll("body, body *"));
    const max = Math.min(elements.length, 200);
    const rows = [];
    for (let i = 0; i < max; i += 1) {
      const el = elements[i];
      const cs = getComputedStyle(el);
      /** @type {Record<string, string>} */
      const computed = {};
      for (const k of keys) {
        computed[k] = cs.getPropertyValue(k);
      }
      const tag = el.tagName.toLowerCase();
      const id = el.id || undefined;
      let classes;
      if (el instanceof HTMLElement && typeof el.className === "string") {
        const c = el.className.trim().split(/\s+/).filter(Boolean).slice(0, 8);
        classes = c.length ? c : undefined;
      }
      rows.push({ tag, id, classes, index: i, computed });
    }
    return { totalElements: elements.length, sampled: rows };
  }, COMPUTED_KEYS);

  await browser.close();

  return json(200, {
    ok: true,
    mode: "rendered",
    pageUrl,
    html,
    computedSnapshots,
    meta: {
      htmlBytes,
      sampledElementCount: computedSnapshots.sampled.length,
      totalElements: computedSnapshots.totalElements,
    },
  });
}

export async function handler(event) {
  try {
    return await handleRequest(event);
  } catch (err) {
    console.error("[capture-rendered]", err);
    return json(500, {
      ok: false,
      error: err instanceof Error ? err.message : "Internal error",
      code: "UNHANDLED",
    });
  }
}
