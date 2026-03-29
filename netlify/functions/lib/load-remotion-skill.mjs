import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path, { join, relative } from "node:path";
import { resolveAgentContextRemotionDir } from "./module-dirname.mjs";

const SKILL_FILE = "SKILL.md";

/**
 * Strip emoji + zero-width characters from text sent to the LLM.
 * Emoji in the skill bundle does not help code quality; it can encourage emoji in TSX
 * and slightly increases JSON escaping risk when models use `content` instead of `content_b64`.
 */
export function sanitizeContextForLlm(text) {
  if (typeof text !== "string" || text.length === 0) return text;
  return (
    text
      // Zero-width / BOM
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      // Most emoji & pictographs (Unicode property escapes)
      .replace(/\p{Extended_Pictographic}/gu, "")
      .replace(/\p{Emoji}/gu, "")
  );
}

/** Remove YAML frontmatter from skill index (--- ... ---). */
export function stripYamlFrontmatter(source) {
  if (!source.startsWith("---")) return source;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return source;
  return source.slice(end + 4).replace(/^\n/, "");
}

export function resolveRemotionSkillRoot() {
  const { candidates } = resolveAgentContextRemotionDir();
  for (const root of candidates) {
    if (existsSync(join(root, SKILL_FILE))) return root;
  }
  throw new Error(
    "Remotion skill not found. Expected agent-context/remotion/SKILL.md (vendored remotion-best-practices)."
  );
}

function collectTextFiles(dir, root, acc) {
  for (const name of readdirSync(dir)) {
    if (name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      collectTextFiles(full, root, acc);
    } else if (/\.(md|mdx|tsx)$/i.test(name)) {
      const rel = relative(root, full).replace(/\\/g, "/");
      const body = readFileSync(full, "utf8");
      acc.push({ rel, body });
    }
  }
}

/**
 * Full vendored skill text for LLM system prompt: SKILL.md (no frontmatter) + all rules.
 */
export function buildRemotionSkillContext() {
  const root = resolveRemotionSkillRoot();
  const skillPath = join(root, SKILL_FILE);
  const skillRaw = readFileSync(skillPath, "utf8");
  const skillBody = stripYamlFrontmatter(skillRaw).trim();

  const parts = [
    "# Remotion skill index (SKILL.md)\n\n",
    skillBody,
    "\n\n# Remotion skill rule files (bundled)\n\n",
  ];

  const files = [];
  const rulesDir = join(root, "rules");
  if (existsSync(rulesDir)) {
    collectTextFiles(rulesDir, root, files);
  }

  files.sort((a, b) => a.rel.localeCompare(b.rel));
  for (const { rel, body } of files) {
    parts.push(`\n--- file: ${rel} ---\n\n`, body, "\n");
  }

  return sanitizeContextForLlm(parts.join(""));
}
