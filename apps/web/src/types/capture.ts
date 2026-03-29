/** Same shape as `computedSnapshots` on a successful rendered capture */
export type ComputedSnapshotsPayload = {
  totalElements: number;
  sampled: {
    tag: string;
    id?: string;
    classes?: string[];
    index: number;
    computed: Record<string, string>;
  }[];
};

export type StaticCaptureResponse =
  | {
      ok: true;
      mode: "static";
      pageUrl: string;
      html: string;
      stylesheets: { href: string; css: string; bytes: number }[];
      inlineStyles: string[];
      warnings: { href?: string; skipped?: string; error?: string }[];
      meta: {
        htmlBytes: number;
        stylesheetCount: number;
        inlineStyleTagCount: number;
      };
    }
  | { ok: false; error: string };

export type RenderedCaptureResponse =
  | {
      ok: true;
      mode: "rendered";
      pageUrl: string;
      html: string;
      computedSnapshots: ComputedSnapshotsPayload;
      meta: {
        htmlBytes: number;
        sampledElementCount: number;
        totalElements: number;
      };
    }
  | { ok: false; error: string; hint?: string };
