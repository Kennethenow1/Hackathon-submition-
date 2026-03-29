import type { ComputedSnapshotsPayload } from "./capture";
import type { FlyerBrandTokens } from "./flyer-brand";

export type WebsiteArtifactSource =
  | "capture-static"
  | "capture-rendered"
  | "upload";

/** Single JSON bundle an AI (or your analysis agent) can ingest. */
export type WebsiteComponentFile = {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  source: WebsiteArtifactSource;
  pageUrl?: string;
  /** Inferred from HTML/CSS at bundle build time for Remotion + previews */
  brand?: FlyerBrandTokens;
  /** Present for `capture-rendered`: real computed styles from headless Chrome (needed when CSS text is empty) */
  computedSnapshots?: ComputedSnapshotsPayload;
  site: {
    /** Primary HTML document */
    html: string;
    /** Concatenated stylesheets + inline blocks (when known) */
    css: string;
    /** Optional script source */
    js: string;
  };
  /** File names for upload provenance */
  fileNames?: { html?: string; css?: string; js?: string };
  /** Slim summary when capture JSON is large */
  captureSummary?: Record<string, unknown>;
  /** Map consumed by the navigation MD generator agent (structural draft → final navigation.md) */
  navigationMd: string;
  navigationDraft: {
    generatedAt: string;
    method: "structural-scan";
    note: string;
  };
};
