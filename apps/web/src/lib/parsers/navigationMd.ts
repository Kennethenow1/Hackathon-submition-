type LineHit = {
  line: number;
  snippet: string;
  kind: string;
};

function lineOfIndex(source: string, index: number): number {
  if (index <= 0) return 1;
  return source.slice(0, index).split("\n").length;
}

function trimSnippet(s: string, max = 140): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}

/** Collect regex matches with 1-based line numbers. */
function scanLines(
  source: string,
  pattern: RegExp,
  kind: string,
  max = 80
): LineHit[] {
  const hits: LineHit[] = [];
  const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
  let m: RegExpExecArray | null;
  let guard = 0;
  while ((m = re.exec(source)) !== null && hits.length < max && guard < 5000) {
    guard += 1;
    const idx = m.index;
    const line = lineOfIndex(source, idx);
    const lineEnd = source.indexOf("\n", idx);
    const row = source.slice(idx, lineEnd === -1 ? undefined : lineEnd);
    hits.push({ line, snippet: trimSnippet(row), kind });
    if (m[0].length === 0) re.lastIndex += 1;
  }
  return hits;
}

function tableRow(cells: string[]): string {
  return `| ${cells.map((c) => c.replace(/\|/g, "\\|")).join(" | ")} |`;
}

function domOutline(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc.body) return "_Could not parse HTML body._\n";

  const lines: string[] = [];
  const headings = doc.querySelectorAll("h1,h2,h3");
  if (headings.length) {
    lines.push("### Heading outline (DOM order)\n");
    headings.forEach((h) => {
      const t = (h.textContent || "").trim().slice(0, 120);
      lines.push(`- **${h.tagName.toLowerCase()}** — ${t || "(empty)"}`);
    });
    lines.push("");
  }

  const navLinks = doc.querySelectorAll("nav a[href], [role='navigation'] a[href]");
  if (navLinks.length) {
    lines.push("### Navigation links (from `<nav>` / `role=navigation`)\n");
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const label = (a.textContent || "").trim().slice(0, 80);
      lines.push(`- \`${href}\` — ${label || "(no label)"}`);
    });
    lines.push("");
  }

  return lines.length ? lines.join("\n") : "";
}

function cssHighlights(css: string): string {
  if (!css.trim()) return "_No CSS text in bundle._\n";
  const rules = scanLines(css, /^\s*([^{]+)\{\s*$/gm, "rule", 40);
  if (!rules.length) {
    return "_No obvious rule blocks found (minified or unusual syntax)._\n";
  }
  const rows = [
    tableRow(["Approx. line (CSS)", "Rule start (truncated)"]),
    tableRow(["---", "---"]),
    ...rules.slice(0, 35).map((h) => tableRow([String(h.line), `\`${h.snippet}\``])),
  ];
  return rows.join("\n") + "\n";
}

function jsHighlights(js: string): string {
  if (!js.trim()) return "_No JS in bundle._\n";
  const fns = scanLines(
    js,
    /^\s*(export\s+)?(async\s+)?function\s+([\w$]+)/gm,
    "function",
    40
  );
  const arrows = scanLines(
    js,
    /^\s*(export\s+)?const\s+([\w$]+)\s*=\s*(async\s*)?\(/gm,
    "const-fn",
    40
  );
  const merged = [...fns, ...arrows]
    .sort((a, b) => a.line - b.line)
    .slice(0, 50);
  if (!merged.length) {
    return "_No top-level `function` / `const x = (` patterns detected._\n";
  }
  const rows = [
    tableRow(["Approx. line (JS)", "Snippet"]),
    tableRow(["---", "---"]),
    ...merged.map((h) => tableRow([String(h.line), `\`${h.snippet}\``])),
  ];
  return rows.join("\n") + "\n";
}

export type NavigationDraftInput = {
  html: string;
  css?: string;
  js?: string;
  source: string;
  pageUrl?: string;
};

/**
 * Draft navigation / IA map with approximate line numbers in source strings.
 * Intended for an AI agent to refine into `navigation.md` for your pipeline.
 */
export function buildNavigationDraft(input: NavigationDraftInput): string {
  const { html, css = "", js = "", source, pageUrl } = input;

  const landmarkTags = [
    "nav",
    "header",
    "main",
    "footer",
    "aside",
    "section",
    "article",
  ];
  const landmarkHits: LineHit[] = [];
  for (const tag of landmarkTags) {
    landmarkHits.push(
      ...scanLines(html, new RegExp(`<${tag}\\b`, "gi"), `&lt;${tag}&gt;`, 25)
    );
  }
  landmarkHits.sort((a, b) => a.line - b.line);

  const anchors = scanLines(html, /<a\s+[^>]*href\s*=\s*["'][^"']*["']/gi, "<a href>", 60);
  const buttons = scanLines(html, /<button\b/gi, "<button>", 40);
  const forms = scanLines(html, /<form\b/gi, "<form>", 20);
  const roles = scanLines(html, /\srole\s*=\s*["'][^"']+["']/gi, "role=", 30);

  const landmarkTable =
    landmarkHits.length === 0
      ? "_No common landmarks matched._\n"
      : [
          tableRow(["Approx. line (HTML)", "Kind", "Snippet"]),
          tableRow(["---", "---", "---"]),
          ...landmarkHits.slice(0, 40).map((h) =>
            tableRow([String(h.line), h.kind, `\`${h.snippet}\``])
          ),
        ].join("\n") + "\n";

  const linkTable =
    anchors.length === 0
      ? "_No `<a href>` patterns matched._\n"
      : [
          tableRow(["Approx. line (HTML)", "Link open tag (truncated)"]),
          tableRow(["---", "---"]),
          ...anchors.slice(0, 35).map((h) =>
            tableRow([String(h.line), `\`${h.snippet}\``])
          ),
        ].join("\n") + "\n";

  const btnTable =
    buttons.length === 0
      ? "_No `<button>` tags matched._\n"
      : [
          tableRow(["Approx. line (HTML)", "Snippet"]),
          tableRow(["---", "---"]),
          ...buttons.slice(0, 25).map((h) =>
            tableRow([String(h.line), `\`${h.snippet}\``])
          ),
        ].join("\n") + "\n";

  const formTable =
    forms.length === 0
      ? "_No `<form>` tags matched._\n"
      : [
          tableRow(["Approx. line (HTML)", "Snippet"]),
          tableRow(["---", "---"]),
          ...forms.map((h) => tableRow([String(h.line), `\`${h.snippet}\``])),
        ].join("\n") + "\n";

  const roleTable =
    roles.length === 0
      ? "_No `role=` attributes matched._\n"
      : [
          tableRow(["Approx. line (HTML)", "Snippet"]),
          tableRow(["---", "---"]),
          ...roles.slice(0, 25).map((h) =>
            tableRow([String(h.line), `\`${h.snippet}\``])
          ),
        ].join("\n") + "\n";

  const dom = domOutline(html);

  const now = new Date().toISOString();

  return `# Navigation & UI map (draft)

> **For the navigation MD generator agent:** This file is a **structural draft** with **approximate line numbers** in \`site.html\`, \`site.css\`, and \`site.js\` inside the accompanying **website component JSON**. Lines are derived from regex / DOM scans—not a full AST. The agent turns this into the final \`navigation.md\` for your pipeline.

## Provenance
- **Generated at:** ${now}
- **Capture / import source:** ${source}
${pageUrl ? `- **Page URL:** ${pageUrl}` : ""}

## How to use with the navigation MD generator agent
1. Open the latest **website component** bundle (JSON): fields \`site.html\`, \`site.css\`, \`site.js\`.
2. Use the tables below to jump to **approximate** locations, then read surrounding context.
3. The agent replaces this draft with a narrative map: user flows, screen purposes, and which code implements them.

---

## Landmarks (raw HTML tags)
${landmarkTable}

## Links (\`<a href>\` occurrences)
${linkTable}

## Buttons
${btnTable}

## Forms
${formTable}

## ARIA \`role\` usage (text scan)
${roleTable}

## DOM-derived outline
${dom || "_No extra DOM outline (empty or parse issue)._\n"}

---

## CSS — rule starts (approximate lines in \`site.css\`)
${cssHighlights(css)}

## JavaScript — top-level patterns (approximate lines in \`site.js\`)
${jsHighlights(js)}
`;
}
