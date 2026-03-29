import type {
  RenderedCaptureResponse,
  StaticCaptureResponse,
} from "../../types/capture";
import type { WebsiteComponentFile } from "../../types/website-artifact";
import { extractFlyerBrand } from "../brand/extractFlyerBrand";
import { buildNavigationDraft } from "../parsers/navigationMd";

function newId(): string {
  return crypto.randomUUID();
}

function buildCssFromStatic(res: Extract<StaticCaptureResponse, { ok: true }>): string {
  const parts: string[] = [];
  for (const sheet of res.stylesheets) {
    parts.push(`/* --- linked stylesheet: ${sheet.href} (${sheet.bytes} bytes) --- */\n`);
    parts.push(sheet.css);
    parts.push("\n\n");
  }
  for (let i = 0; i < res.inlineStyles.length; i += 1) {
    parts.push(`/* --- inline <style> block ${i + 1} --- */\n`);
    parts.push(res.inlineStyles[i]);
    parts.push("\n\n");
  }
  return parts.join("").trim();
}

export function bundleFromStaticCapture(
  res: Extract<StaticCaptureResponse, { ok: true }>
): WebsiteComponentFile {
  const css = buildCssFromStatic(res);
  const navigationMd = buildNavigationDraft({
    html: res.html,
    css,
    js: "",
    source: "capture-static",
    pageUrl: res.pageUrl,
  });
  const brand = extractFlyerBrand({
    html: res.html,
    css,
    pageUrl: res.pageUrl,
  });

  return {
    schemaVersion: 1,
    id: newId(),
    createdAt: new Date().toISOString(),
    source: "capture-static",
    pageUrl: res.pageUrl,
    brand,
    site: {
      html: res.html,
      css,
      js: "",
    },
    captureSummary: {
      mode: res.mode,
      stylesheetCount: res.meta.stylesheetCount,
      inlineStyleTagCount: res.meta.inlineStyleTagCount,
      htmlBytes: res.meta.htmlBytes,
      warningCount: res.warnings.length,
    },
    navigationMd,
    navigationDraft: {
      generatedAt: new Date().toISOString(),
      method: "structural-scan",
      note: "Input for the navigation MD generator agent; line numbers are approximate.",
    },
  };
}

export function bundleFromRenderedCapture(
  res: Extract<RenderedCaptureResponse, { ok: true }>
): WebsiteComponentFile {
  const navigationMd = buildNavigationDraft({
    html: res.html,
    css: "",
    js: "",
    source: "capture-rendered",
    pageUrl: res.pageUrl,
  });

  const brand = extractFlyerBrand({
    html: res.html,
    css: "",
    pageUrl: res.pageUrl,
    computedSnapshots: res.computedSnapshots,
  });

  const appendix = `

---

## Appendix: rendered capture (computed style sample)

- **Total elements (DOM):** ${res.computedSnapshots.totalElements}
- **Sampled for computed styles:** ${res.meta.sampledElementCount}
- Use the JSON field \`computedSnapshots\` in the raw API response if you stored it; this bundle focuses on serialized HTML.
`;

  return {
    schemaVersion: 1,
    id: newId(),
    createdAt: new Date().toISOString(),
    source: "capture-rendered",
    pageUrl: res.pageUrl,
    brand,
    computedSnapshots: res.computedSnapshots,
    site: {
      html: res.html,
      css: "",
      js: "",
    },
    captureSummary: {
      mode: res.mode,
      htmlBytes: res.meta.htmlBytes,
      sampledElementCount: res.meta.sampledElementCount,
      totalElements: res.meta.totalElements,
    },
    navigationMd: navigationMd + appendix,
    navigationDraft: {
      generatedAt: new Date().toISOString(),
      method: "structural-scan",
      note: "Input for the navigation MD generator agent. CSS omitted in bundle; HTML reflects post-JS DOM.",
    },
  };
}

export function bundleFromUpload(input: {
  html: string;
  css: string;
  js: string;
  fileNames: { html?: string; css?: string; js?: string };
}): WebsiteComponentFile {
  const navigationMd = buildNavigationDraft({
    html: input.html,
    css: input.css,
    js: input.js,
    source: "upload",
  });
  const brand = extractFlyerBrand({
    html: input.html,
    css: input.css,
    pageUrl: undefined,
  });

  return {
    schemaVersion: 1,
    id: newId(),
    createdAt: new Date().toISOString(),
    source: "upload",
    brand,
    site: {
      html: input.html,
      css: input.css,
      js: input.js,
    },
    fileNames: input.fileNames,
    navigationMd,
    navigationDraft: {
      generatedAt: new Date().toISOString(),
      method: "structural-scan",
      note: "Input for the navigation MD generator agent; line numbers are approximate.",
    },
  };
}
