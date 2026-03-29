import type { ComputedSnapshotsPayload } from "../../types/capture";
import type { FlyerBrandTokens } from "../../types/flyer-brand";

const DEFAULT: FlyerBrandTokens = {
  primary: "#6366f1",
  secondary: "#4f46e5",
  accent: "#a78bfa",
  background: "#0f0f12",
  deep: "#050508",
  logoUrl: null,
  productName: "Your site",
};

/** HSL in degrees / 0–100 / 0–100 → #rrggbb */
function hslToHex(h: number, sPct: number, lPct: number): string {
  const s = Math.max(0, Math.min(100, sPct)) / 100;
  const l = Math.max(0, Math.min(100, lPct)) / 100;
  const hh = ((h % 360) + 360) % 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hh / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.max(0, Math.min(255, Math.round(255 * c)));
  };
  const r = f(0);
  const g = f(8);
  const b = f(4);
  const x = (n: number) => n.toString(16).padStart(2, "0");
  return `#${x(r)}${x(g)}${x(b)}`;
}

/** OKLCH (L 0–1 or 0–100%, C, H deg) → #rrggbb (clip to sRGB gamut) */
function oklchToHex(L: number, C: number, H: number): string {
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  let l = L;
  if (l > 1 && l <= 100) l /= 100;
  l = Math.max(0, Math.min(1, l));

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  let bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;
  const clip = (x: number) => Math.max(0, Math.min(1, x));
  r = clip(r);
  g = clip(g);
  bLin = clip(bLin);
  const linToSrgb = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  const to255 = (x: number) =>
    Math.max(0, Math.min(255, Math.round(255 * linToSrgb(x))));
  const hx = (n: number) => n.toString(16).padStart(2, "0");
  return `#${hx(to255(r))}${hx(to255(g))}${hx(to255(bLin))}`;
}

function normalizeHexLike(raw: string): string | null {
  const s = raw.trim().replace(/!important\s*$/i, "").trim();
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    const h = s.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(s) || /^#[0-9a-f]{8}$/i.test(s)) {
    return s.slice(0, 7).toLowerCase();
  }
  const rgb = s.match(
    /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i
  );
  if (rgb) {
    const r = Math.round(Number(rgb[1]));
    const g = Math.round(Number(rgb[2]));
    const b = Math.round(Number(rgb[3]));
    const to = (n: number) =>
      Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
    return `#${to(r)}${to(g)}${to(b)}`;
  }
  return null;
}

/** Shadcn-style: `222.2 47.4% 11.2%` or with slash alpha */
function parseShadcnHslComponents(s: string): string | null {
  const t = s.trim().replace(/!important\s*$/i, "").trim();
  const m = t.match(
    /^(-?[\d.]+)\s+([\d.]+%)\s+([\d.]+%)(?:\s*\/\s*[\d.]+%?)?$/
  );
  if (!m) return null;
  const h = Number(m[1]);
  const sp = parseFloat(m[2]);
  const lp = parseFloat(m[3]);
  if (Number.isNaN(h) || Number.isNaN(sp) || Number.isNaN(lp)) return null;
  return hslToHex(h, sp, lp);
}

function parseHslFunction(s: string): string | null {
  const t = s.trim();
  // hsl(210 40% 50%) / hsl(210, 40%, 50%) / hsla(..., 0.5)
  const m =
    t.match(
      /^hsla?\(\s*(-?[\d.]+)\s+([\d.]+%)\s+([\d.]+%)(?:\s*[,\/]\s*[\d.]+%?)?\s*\)$/i
    ) ||
    t.match(
      /^hsla?\(\s*(-?[\d.]+)\s*,\s*([\d.]+%)\s*,\s*([\d.]+%)(?:\s*[,\/]\s*[\d.]+)?\s*\)$/i
    );
  if (!m) return null;
  return hslToHex(Number(m[1]), parseFloat(m[2]), parseFloat(m[3]));
}

function parseOklchFunction(s: string): string | null {
  const t = s.trim();
  const m = t.match(
    /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+(-?[\d.]+)(?:deg)?(?:\s*\/\s*[\d.]+%?)?\s*\)$/i
  );
  if (!m) return null;
  let L = parseFloat(m[1]);
  if (m[1].includes("%")) L /= 100;
  const C = parseFloat(m[2]);
  const H = parseFloat(m[3]);
  if (Number.isNaN(L) || Number.isNaN(C) || Number.isNaN(H)) return null;
  return oklchToHex(L, C, H);
}

/**
 * All custom properties (raw). Shadcn/Tailwind often use non-hex values.
 */
function extractRawCssVars(css: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const name = m[1].toLowerCase();
    const val = m[2].trim().replace(/!important\s*$/i, "").trim();
    if (val) map.set(name, val);
  }
  return map;
}

function resolveVarChain(
  value: string,
  raw: Map<string, string>,
  depth = 0
): string {
  if (depth > 12) return value;
  const v = value.trim();
  const varOnly = v.match(/^var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\s*\)$/i);
  if (varOnly) {
    const key = varOnly[1].toLowerCase();
    const inner = raw.get(key);
    if (inner) return resolveVarChain(inner, raw, depth + 1);
    if (varOnly[2]) return resolveVarChain(varOnly[2].trim(), raw, depth + 1);
    return v;
  }
  return v;
}

/** `hsl(var(--primary))` / `hsl(var(--foreground) / 0.5)` */
function expandHslVar(
  value: string,
  raw: Map<string, string>
): string | null {
  const t = value.trim();
  const m = t.match(
    /^hsla?\(\s*var\(\s*--([\w-]+)\s*\)\s*(?:\/\s*[^)]+)?\s*\)$/i
  );
  if (!m) return null;
  const key = m[1].toLowerCase();
  const inner = raw.get(key);
  if (!inner) return null;
  const resolved = resolveVarChain(inner, raw);
  if (/^[\d.-]/.test(resolved) && resolved.includes("%")) {
    return `hsl(${resolved})`;
  }
  return null;
}

function colorValueToHex(value: string, raw: Map<string, string>): string | null {
  const chain = resolveVarChain(value, raw);

  const hex = normalizeHexLike(chain);
  if (hex) return hex;

  const hslFn = parseHslFunction(chain);
  if (hslFn) return hslFn;

  const ok = parseOklchFunction(chain);
  if (ok) return ok;

  const shadcn = parseShadcnHslComponents(chain);
  if (shadcn) return shadcn;

  const hslWrapped = expandHslVar(chain, raw);
  if (hslWrapped) {
    const h2 = parseHslFunction(hslWrapped);
    if (h2) return h2;
  }

  return null;
}

/** Resolved --* → hex only when parseable */
function buildResolvedColorMap(css: string): Map<string, string> {
  const raw = extractRawCssVars(css);
  const out = new Map<string, string>();
  for (const [name, val] of raw) {
    const hex = colorValueToHex(val, raw);
    if (hex) out.set(name, hex);
  }
  return out;
}

function pickFromVars(
  vars: Map<string, string>,
  candidates: string[]
): string | null {
  for (const key of candidates) {
    const v = vars.get(key);
    if (v) return v;
  }
  for (const [k, v] of vars) {
    if (candidates.some((c) => k === c || k.endsWith(`-${c}`))) return v;
  }
  return null;
}

/** Prefer colors from :root / .theme / html blocks (not random SVG hex) */
function scrapeHexFromRootishCss(css: string, limit = 20): string[] {
  const chunks: string[] = [];
  const blockRe =
    /(?:^|[\s,])(:root|html|\.dark|\.light|\.theme-dark|\.theme-light)\s*[^{]*\{([^}]*)\}/gi;
  let bm: RegExpExecArray | null;
  while ((bm = blockRe.exec(css)) !== null) {
    chunks.push(bm[2]);
  }
  const text = chunks.length ? chunks.join("\n") : css.slice(0, 120_000);
  const found: string[] = [];
  const re = /#([0-9a-f]{3}|[0-9a-f]{6})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const n = normalizeHexLike(m[0]);
    if (n && !found.includes(n)) found.push(n);
    if (found.length >= limit) break;
  }
  return found;
}

function resolveUrl(href: string, baseUrl?: string): string | null {
  const h = href.trim();
  if (!h || h.startsWith("data:")) return h;
  try {
    const base =
      baseUrl && /^https?:/i.test(baseUrl)
        ? baseUrl
        : "https://example.com/";
    return new URL(h, base).href;
  } catch {
    return null;
  }
}

function extractLogoUrl(html: string, baseUrl?: string): string | null {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const og = doc.querySelector(
      'meta[property="og:image"], meta[name="twitter:image"]'
    );
    const ogC = og?.getAttribute("content")?.trim();
    if (ogC) {
      const u = resolveUrl(ogC, baseUrl);
      if (u) return u;
    }

    const apple = doc.querySelector('link[rel="apple-touch-icon"]');
    const appleH = apple?.getAttribute("href")?.trim();
    if (appleH) {
      const u = resolveUrl(appleH, baseUrl);
      if (u) return u;
    }

    const selectors = [
      'img[alt*="logo" i]',
      'img[class*="logo" i]',
      'img[id*="logo" i]',
      "header img",
      "nav img",
      '[class*="brand" i] img',
    ];
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      const src = el?.getAttribute("src")?.trim();
      if (src) {
        const u = resolveUrl(src, baseUrl);
        if (u) return u;
      }
    }

    const icon = doc.querySelector('link[rel*="icon" i]');
    const iconH = icon?.getAttribute("href")?.trim();
    if (iconH) {
      const u = resolveUrl(iconH, baseUrl);
      if (u && !/\.ico(\?|$)/i.test(u)) return u;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function extractProductName(html: string): string {
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const og = doc
      .querySelector('meta[property="og:site_name"]')
      ?.getAttribute("content")
      ?.trim();
    if (og) return og.slice(0, 48);
    const t = doc.querySelector("title")?.textContent?.trim();
    if (t) {
      const short = t.split(/[|\u2013\u2014\-]/)[0]?.trim() ?? t;
      return short.slice(0, 48) || DEFAULT.productName;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT.productName;
}

function themeColorFromHtml(html: string): string | null {
  const m = html.match(
    /<meta\s+name=["']theme-color["']\s+content=["']([^"']+)["']/i
  );
  if (m?.[1]) return normalizeHexLike(m[1]);
  return null;
}

/** Inline `<style>` in HTML (common for file uploads without a separate .css file). */
function extractInlineStyleFromHtml(html: string): string {
  const parts: string[] = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const block = m[1]?.trim();
    if (block) parts.push(`/* inline <style> */\n${block}`);
  }
  return parts.join("\n\n");
}

function shadeHex(hex: string, factor: number): string {
  const n = normalizeHexLike(hex);
  if (!n || n.length < 7) return hex;
  const r = parseInt(n.slice(1, 3), 16);
  const g = parseInt(n.slice(3, 5), 16);
  const b = parseInt(n.slice(5, 7), 16);
  const c = (x: number) =>
    Math.max(0, Math.min(255, Math.round(x * factor)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** `body { background: ... }` declarations */
function bodyBackgroundFromCss(css: string, raw: Map<string, string>): string | null {
  const re = /body[^{]*\{([^}]+)\}/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    const block = m[1];
    const bg = block.match(
      /background(?:-color)?\s*:\s*([^;]+);/i
    )?.[1];
    if (bg) {
      const hex = colorValueToHex(bg, raw);
      if (hex) return hex;
    }
  }
  return null;
}

/** `getComputedStyle` values: rgb(), rgba(), or hex */
function parseComputedColor(val: string | undefined): string | null {
  if (!val) return null;
  const t = val.trim().toLowerCase();
  if (!t || t === "transparent") return null;
  let m = t.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/
  );
  if (!m) {
    m = t.match(
      /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/
    );
  }
  if (m) {
    if (m[4] !== undefined && parseFloat(m[4]) < 0.04) return null;
    const r = Math.round(Number(m[1]));
    const g = Math.round(Number(m[2]));
    const b = Math.round(Number(m[3]));
    const to = (n: number) =>
      Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
    return `#${to(r)}${to(g)}${to(b)}`.toLowerCase();
  }
  return normalizeHexLike(t);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const n = normalizeHexLike(hex);
  if (!n || n.length < 7) return null;
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}

function relLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const r = lin(rgb.r);
  const g = lin(rgb.g);
  const b = lin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function isNearWhite(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return rgb.r > 245 && rgb.g > 245 && rgb.b > 245;
}

function isNearBlack(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  return rgb.r < 18 && rgb.g < 18 && rgb.b < 18;
}

function rgbToHsl(hex: string): { h: number; s: number; l: number } {
  const rgb = hexToRgb(hex);
  if (!rgb) return { h: 0, s: 0, l: 0 };
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s, l };
}

function mixHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  if (!A || !B) return a;
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  const to = (n: number) =>
    Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${to(m(A.r, B.r))}${to(m(A.g, B.g))}${to(m(A.b, B.b))}`;
}

function warmHue(h: number): boolean {
  return h <= 58 || h >= 328;
}

function warmScore(hex: string): number {
  const { h, s } = rgbToHsl(hex);
  return s * (warmHue(h) ? 1.35 : 1) * (s > 0.2 ? 1.2 : 1);
}

function pickDarkest(hexes: string[]): string | null {
  const xs = hexes.filter((h) => h && !isNearWhite(h));
  if (!xs.length) return null;
  return [...xs].sort((a, b) => relLuminance(a) - relLuminance(b))[0];
}

function rowClassText(row: { classes?: string[] }): string {
  return (row.classes ?? []).join(" ").toLowerCase();
}

/** Class substrings that often mark accent / icon / promo UI (any product). */
const ACCENT_CLASS_RE =
  /heart|donate|support|destructive|danger|accent|error|warning|success|love|brand|cta|badge|chip|pill|promo|highlight|gradient|icon|toolbar|fab|floating|star|fav|notification|sale|new/i;

/**
 * Likely clickable / form controls (avoid matching every `rounded-*` layout div).
 */
const CONTROL_STRICT_RE =
  /\b(btn|button|cta|submit|connect|sign|login|register|signup|get-started|purchase|buy|download|subscribe|chip|pill|badge|tab|nav-item|fab|listbox|combobox|menu-item|call-to-action)\b/i;

/**
 * Uses headless computed styles (rendered capture) when bundled CSS is empty — matches what
 * users see for SPAs and dynamic themes on any URL.
 */
function extractBrandFromComputedSnapshots(
  payload: ComputedSnapshotsPayload
): Partial<FlyerBrandTokens> | null {
  const { sampled } = payload;
  if (!sampled.length) return null;

  const bodyRow = sampled.find((r) => r.tag === "body");
  let background = bodyRow
    ? parseComputedColor(bodyRow.computed["background-color"])
    : null;

  if (!background) {
    for (const row of sampled.slice(0, 50)) {
      const bg = parseComputedColor(row.computed["background-color"]);
      if (bg && !isNearWhite(bg)) {
        background = bg;
        break;
      }
    }
  }

  const bodyText = bodyRow
    ? parseComputedColor(bodyRow.computed["color"])
    : null;

  const accentHints: string[] = [];
  const controlBorders: string[] = [];
  const controlBg: string[] = [];
  const controlFg: string[] = [];
  const chroma: { hex: string; score: number }[] = [];

  for (const row of sampled) {
    const cls = rowClassText(row);
    const color = parseComputedColor(row.computed["color"]);
    const bg = parseComputedColor(row.computed["background-color"]);
    const border = parseComputedColor(row.computed["border-color"]);
    const fill = parseComputedColor(row.computed["fill"]);
    const stroke = parseComputedColor(row.computed["stroke"]);

    if (ACCENT_CLASS_RE.test(cls) || row.tag === "svg") {
      for (const c of [stroke, fill, color]) {
        if (c && !isNearWhite(c) && !isNearBlack(c)) accentHints.push(c);
      }
    }

    if (
      row.tag === "button" ||
      (row.tag === "a" && CONTROL_STRICT_RE.test(cls)) ||
      ((row.tag === "div" ||
        row.tag === "span" ||
        row.tag === "label") &&
        CONTROL_STRICT_RE.test(cls))
    ) {
      if (border && !isNearWhite(border)) controlBorders.push(border);
      if (bg && !isNearWhite(bg)) controlBg.push(bg);
      else if (color && !isNearWhite(color)) controlFg.push(color);
    }

    if (
      (row.tag === "h1" || row.tag === "h2" || row.tag === "h3") &&
      color &&
      !isNearWhite(color)
    ) {
      controlFg.push(color);
    }

    for (const hex of [color, bg, border, fill, stroke]) {
      if (!hex || isNearWhite(hex) || isNearBlack(hex)) continue;
      const { s, l } = rgbToHsl(hex);
      if (s > 0.08 && l > 0.08 && l < 0.93) {
        chroma.push({ hex, score: s * (0.5 + Math.abs(0.5 - l)) });
      }
    }
  }

  chroma.sort((a, b) => b.score - a.score);

  const primary =
    pickDarkest(controlBorders) ??
    pickDarkest(controlBg) ??
    pickDarkest(controlFg) ??
    (bodyText && !isNearWhite(bodyText) ? bodyText : null) ??
    chroma.find((c) => relLuminance(c.hex) < 0.45)?.hex ??
    null;

  if (!background || !primary) return null;

  const accentWarm = [...accentHints].sort(
    (a, b) => warmScore(b) - warmScore(a)
  )[0];
  const accentChroma = [...chroma].sort(
    (a, b) => warmScore(b.hex) - warmScore(a.hex)
  )[0]?.hex;
  const accent =
    accentWarm ??
    (accentChroma && rgbToHsl(accentChroma).s > 0.25 ? accentChroma : null) ??
    chroma[0]?.hex ??
    shadeHex(primary, 1.12);

  const secondary =
    bodyText && bodyText !== primary
      ? mixHex(bodyText, background, 0.25)
      : mixHex(primary, background, 0.35);

  return {
    primary,
    secondary,
    accent,
    background,
    deep: shadeHex(background, 0.42),
  };
}

export type ExtractFlyerBrandInput = {
  html: string;
  css: string;
  pageUrl?: string;
  /** From `capture-rendered` — computed styles after JS; works for any URL with that capture mode */
  computedSnapshots?: ComputedSnapshotsPayload;
};

function extractFlyerBrandFromStylesheets(
  html: string,
  css: string,
  pageUrl?: string
): FlyerBrandTokens {
  const raw = extractRawCssVars(css);
  const vars = buildResolvedColorMap(css);
  const fromRootCss = scrapeHexFromRootishCss(css, 24);

  const primary =
    pickFromVars(vars, [
      "primary",
      "color-primary",
      "brand",
      "brand-primary",
      "theme-primary",
      "chart-1",
    ]) ||
    themeColorFromHtml(html) ||
    fromRootCss[0] ||
    DEFAULT.primary;

  const secondary =
    pickFromVars(vars, [
      "secondary",
      "brand-secondary",
      "color-secondary",
      "muted",
      "muted-foreground",
      "chart-2",
    ]) ||
    fromRootCss[1] ||
    shadeHex(primary, 0.78);

  const accent =
    pickFromVars(vars, [
      "accent",
      "brand-accent",
      "highlight",
      "color-link",
      "chart-3",
      "ring",
    ]) ||
    fromRootCss[2] ||
    shadeHex(primary, 1.12);

  const background =
    pickFromVars(vars, [
      "background",
      "color-background",
      "surface",
      "body-bg",
      "card",
      "popover",
    ]) ||
    bodyBackgroundFromCss(css, raw) ||
    fromRootCss.find((h) => {
      const r = parseInt(h.slice(1, 3), 16);
      const g = parseInt(h.slice(3, 5), 16);
      const b = parseInt(h.slice(5, 7), 16);
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return lum < 0.55;
    }) ||
    DEFAULT.background;

  const deep = shadeHex(background, 0.42);

  const logoUrl = extractLogoUrl(html, pageUrl);

  return {
    primary,
    secondary,
    accent,
    background,
    deep,
    logoUrl,
    productName: extractProductName(html),
  };
}

/**
 * Infers brand from any captured HTML + CSS file + optional rendered computed snapshots.
 * Merges inline `<style>` blocks from HTML so file uploads without a separate .css still work.
 */
export function extractFlyerBrand(input: ExtractFlyerBrandInput): FlyerBrandTokens {
  const inlineCss = extractInlineStyleFromHtml(input.html);
  const mergedCss = [input.css.trim(), inlineCss].filter(Boolean).join("\n\n");

  const base = extractFlyerBrandFromStylesheets(
    input.html,
    mergedCss,
    input.pageUrl
  );
  let snap: Partial<FlyerBrandTokens> | null = null;
  if (input.computedSnapshots?.sampled?.length) {
    snap = extractBrandFromComputedSnapshots(input.computedSnapshots);
  }
  if (!snap) return base;

  return {
    primary: snap.primary ?? base.primary,
    secondary: snap.secondary ?? base.secondary,
    accent: snap.accent ?? base.accent,
    background: snap.background ?? base.background,
    deep: snap.deep ?? base.deep,
    logoUrl: base.logoUrl,
    productName: base.productName,
  };
}
