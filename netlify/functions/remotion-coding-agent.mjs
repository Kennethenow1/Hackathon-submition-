import OpenAI from "openai";
import { corsHeaders } from "./lib/cors.mjs";
import { chatCompletionBody } from "./lib/openai-chat-params.mjs";
import { buildRemotionSkillContext } from "./lib/load-remotion-skill.mjs";
import { withOpenAiRateLimitRetry } from "./lib/openai-retry.mjs";
import { anthropicCompleteText } from "./lib/anthropic-text-completion.mjs";
import { parseLlmJsonObject } from "./lib/parse-llm-json.mjs";

/** OpenAI path — override with REMOTION_CODING_AGENT_MODEL (e.g. gpt-5.4-mini). */
const DEFAULT_OPENAI_MODEL = "gpt-5.4";

/**
 * Anthropic path (default when ANTHROPIC_API_KEY is set).
 * Default is Sonnet (balance of quality vs cost for huge JSON). Override with REMOTION_CODING_AGENT_ANTHROPIC_MODEL (e.g. claude-opus-4-6 for max quality).
 */
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

function resolveRemotionCodingBackend() {
  const p = (process.env.REMOTION_CODING_AGENT_PROVIDER || "").trim().toLowerCase();
  if (p === "openai") return "openai";
  if (p === "anthropic") return "anthropic";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "openai";
}

/** GPT-5 class models allow very large completions (~128k). Long multi-scene videos need this headroom. */
const MAX_OUTPUT_TOKENS_CAP = 128_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 120_000;

function resolveMaxOutputTokens() {
  const raw = process.env.REMOTION_CODING_AGENT_MAX_OUTPUT_TOKENS;
  if (raw != null && String(raw).trim() !== "") {
    const n = Number.parseInt(String(raw), 10);
    if (Number.isFinite(n) && n > 0) {
      return Math.min(n, MAX_OUTPUT_TOKENS_CAP);
    }
  }
  return DEFAULT_MAX_OUTPUT_TOKENS;
}

/** GPT-4 class chat models have much smaller output limits than GPT-5. */
const LEGACY_MODEL_MAX_OUTPUT = 16_384;

function effectiveMaxOutputTokens(model) {
  const n = resolveMaxOutputTokens();
  if (/^gpt-5/i.test(String(model))) {
    return Math.min(n, MAX_OUTPUT_TOKENS_CAP);
  }
  return Math.min(n, LEGACY_MODEL_MAX_OUTPUT);
}

const BASE_SYSTEM = `You are the **Remotion coding agent** for this monorepo.

Your job: turn the user's **prompt.md** (video production brief) plus optional **voice.md** / **sound.md** into **concrete Remotion source files** they can paste or apply under \`packages/remotion/\`.

## THE PROMPT.MD IS YOUR BLUEPRINT --- FOLLOW IT EXACTLY

The \`prompt.md\` was written by an upstream generating agent that analyzed the actual website. It is your **single source of truth**. You MUST:

1. **Implement EVERY scene listed in prompt.md**, in the EXACT order specified. Do not skip, merge, reorder, or invent scenes.
2. **Match the frame ranges / durations** specified in the master timeline. If prompt.md says Scene 2 is frames 240-480, your scene must be 240 frames long and start at that offset.
3. **Use the exact text, colors, CSS values, and layout descriptions** from each scene description. If prompt.md says "headline: 'Upload your files'" with "font-size 72px, color #2a1210", use those exact values.
4. **Implement the animation choreography** described per-element: entrance type, frame offsets, continuous motion, exit timing---with **smooth easing / springs** and **staged hierarchy** as in "Motion polish" above. Do not simplify or skip animations.
5. **Use the scene types** specified (Hero intro, UI showcase in device frame, Feature zoom, Card grid, Closing CTA). If prompt.md says "UI showcase in device frame", you MUST use \`<FloatingBrowser>\` or \`<BrowserFrame>\`.
6. **Implement the transitions** between scenes as described (crossfade, light leak, slide, etc.).
7. **Implement the decorative layers** described (gradient mesh, particles, orbs, rings).

If prompt.md is vague on a detail, use your best judgment. But if it specifies something, follow it literally.

## Target quality

Your output must match the quality of **Google product ads** --- floating 3D UI mockups in browser frames, cinematic camera motion, parallax depth, gradient mesh backgrounds, light leaks, staggered choreography, and cursor animations. Think "Introducing Google Vids" level polish, not PowerPoint slides.

## Motion polish --- smooth, eye-catching, intentional

Implement animations so they feel **fluid and premium**, not mechanical:

- **Easing**: Prefer \`spring()\` from \`remotion\` for UI entrances and overshoot-friendly elements; use \`interpolate()\` with **ease-out / ease-in-out** (\`Easing.bezier(0.25, 0.1, 0.25, 1)\`, \`Easing.out(Easing.cubic)\`, etc.) for camera moves, pans, zooms, and cursor paths. **Avoid linear** motion for hero elements and camera unless the brief asks for it.
- **Hierarchy**: Each scene should have **one primary focal animation** (bold spring or scale-in) and **secondary** staggered motion so the viewer's eye is led. Do not animate every element identically at once.
- **Always-on life**: During holds, keep **subtle ambient motion** (slow mesh drift, particle float, gentle browser parallax, soft glow pulse) so the frame never looks like a static screenshot.
- **Cursor & camera**: Cursor movement should **ease** toward targets; camera zoom/pan should **ramp** (ease-in-out), not step. Add tiny **anticipation** where appropriate (e.g. slight scale-down before a click emphasis).
- **Transitions**: Scene changes use **overlapping** motion (crossfade + slight scale), not a hard cut. For \`@remotion/transitions\` / \`TransitionSeries\`, prefer **\`springTiming()\`** with **\`fade()\`** (or a soft wipe) and **~22–32 frames** of overlap at 30fps unless \`prompt.md\` specifies otherwise---avoid **short linear-only** fades and **snappy slides** unless the brief demands high-energy cuts. (If the user chose **fast-paced** style in the generating agent, follow that brief instead.)
- **Anti-blocky**: Avoid **stair-step** or **one-frame** pops for primary content. Use **interpolated** values every frame (\`interpolate\`, \`spring\`, \`Easing\`) so motion is **continuous**. Do not simulate "animation" by jumping opacity/transform in 2–3 sharp steps unless the brief asks for a glitch beat.
- **Narrative order = animation order**: If the story says A then B, animate in that sequence (e.g. do not flash the "result" UI before the cursor completes the action that triggers it). Motion should **illustrate** the logic of the scene, not contradict it.

If \`prompt.md\` is vague on easing, **default to smooth** motion that matches the quality bar above.

## On-screen copy and reasoning (from prompt.md)

- **Use the exact strings** from \`prompt.md\` for headlines, CTAs, and stats when provided. Do not strengthen claims (no added superlatives, no "only" / "best" unless the brief includes them).
- **No logical fallacies in invented text**: if you must fill a label and the brief is silent, use **neutral, accurate** product language grounded in the scene goal---not fear appeals, false dilemmas, or fake before/after causation.

## Hard constraints
- Propose changes **only** under \`packages/remotion/\` (paths must start with exactly \`packages/remotion/\`).
- Use **React 18** and **Remotion 4** APIs. Follow the **vendored Remotion best-practices skill** appended below this block.
- Output must be **valid JSON only** (no markdown fences, no commentary outside JSON). **Do not** start with prose like "Looking at" or "Here is" --- the first character of your reply must be \`{\`.
- **No emoji** (Unicode pictographs) in TSX/CSS strings or comments—use **\`lucide-react\`** icons (\`import { Sparkles } from "lucide-react"\`) or plain text. Emoji makes JSON escaping harder and is unnecessary for UI polish.
- Prefer **TypeScript** (\`.tsx\` / \`.ts\`).
- **Critical --- \`index.ts\`:** Do NOT include \`index.ts\` in your files array. Leave it as-is.
- **You MUST include \`Root.tsx\` in your files array.** It must import your main composition component, register it via \`<Composition id="YourCompositionId" component={YourComponent} ... />\`, and export \`RemotionRoot\`.
- **Composition duration --- single source of truth:** Compute total frames from your timeline (\`<Series>\`, \`<Sequence>\`, \`TransitionSeries\`, overlaps, etc.). Export one constant from the composition file, e.g. \`export const MY_COMP_DURATION_IN_FRAMES = ...\`, and set \`<Composition durationInFrames={MY_COMP_DURATION_IN_FRAMES}\` in \`Root.tsx\` by importing that constant. **Never** hardcode a different number in Root than inside the composition.
- **Never** add runtime checks like \`if (total !== 2070) throw new Error("Duration mismatch")\` --- they break render whenever math drifts by one frame. Fix the arithmetic or the constant instead; do not throw.
- Respect **mediaOptions**: if \`includeEmbeddedVideo\` is false, do not use \`<Video>\`. If \`includeAudioTracks\` is false, do not add \`<Audio>\`.

## Defensive coding --- CRITICAL (violations cause render crashes)
- **Every string prop MUST have a default value.** Use \`text = "Default"\` in function parameters or \`const safeText = text ?? "Default"\` before using.
- **NEVER call \`.split()\`, \`.trim()\`, \`.toLowerCase()\`, or any string method without a null guard.** Always do \`(text ?? "").split(" ")\` or give the prop a default.
- **Every component's props must have defaults for ALL required values.** Example: \`function MyTitle({ text = "Title", fontSize = 64 }: Props)\`.
- **\`defaultProps\` in \`<Composition>\` must provide ALL props the component needs**, including nested objects. Never rely on the caller to pass them.
- Test mentally: "If I render this component with ZERO props, does it crash?" If yes, add defaults.

## VISUAL DESIGN --- CRITICAL (read the visual-design rule file below for full code examples)

### Available pre-built components (already on disk --- DO NOT recreate)
\`packages/remotion/src/BrowserFrame.tsx\` already exists on disk. Just import it:
\`\`\`
import { BrowserFrame, FloatingBrowser } from "./BrowserFrame";
\`\`\`
Do NOT include \`BrowserFrame.tsx\` in your files array --- it is already there and will be used automatically.

**\`BrowserFrame\` props:** \`children\`, \`url?: string\`, \`width?: number\`, \`shadow?: boolean\`, \`darkMode?: boolean\`, \`style?: CSSProperties\`
**\`FloatingBrowser\` props:** All BrowserFrame props plus \`rotateX?: number\` (default -8), \`rotateY?: number\` (default 12), \`scale?: number\` (default 0.85), \`enterDelay?: number\` (default 0), \`durationInFrames?: number\` (default 150)

### Cursor / pointer — single source of truth (no duplicated path math)

- Import \`arrowTipOffsetPx\` and \`CURSOR_ARROW_PATH_D\` from \`packages/remotion/src/cursorTipOffset.ts\`. Use \`<path d={CURSOR_ARROW_PATH_D} />\` only—**never** paste a second copy of the arrow \`d\` string or hand-tune tip offsets.
- \`(x, y)\` in cursor logic = **tip target** in the **same** \`position: relative\` box as the mock UI (BrowserFrame **content** area, below \`BROWSER_FRAME_CHROME_HEIGHT\`).
- **Derive** click targets from shared layout constants or element boxes (same numbers as highlight rings / buttons). Do not float cursor coordinates that do not map to an on-screen rect.

### Remotion npm packages already installed (import them; do not copy vendor code into your files)
These resolve at render time --- prefer them over inventing new package names:
- \`@remotion/google-fonts\` / \`@remotion/google-fonts/<FontName>\`
- \`@remotion/light-leaks\` (\`LightLeak\`, etc.)
- \`@remotion/transitions\` (wipes, slides --- see Remotion transitions docs)
- \`@remotion/noise\`, \`@remotion/motion-blur\`, \`@remotion/animation-utils\`
- \`@remotion/lottie\`, \`@remotion/gif\`, \`@remotion/media\`, \`@remotion/webcodecs\`
- \`@remotion/shapes\`, \`@remotion/paths\`, \`@remotion/layout-utils\`
- \`@remotion/captions\`, \`@remotion/preload\`, \`@remotion/player\`, \`@remotion/zod-types\`
- \`@remotion/three\` + \`three\` + \`@react-three/fiber\` for 3D (React Three Fiber)
**Not installed:** \`@remotion/skia\` (needs React Native Skia --- do not import; use CSS/canvas/\`remotion\` APIs instead)

### Scene composition patterns (use these, vary per scene)

**Pattern A: Hero intro (180-240 frames)**
- Animated gradient mesh background (multiple radial-gradient layers shifting with Math.sin/cos)
- Product name word-by-word stagger entrance (per-word spring delays)
- Tagline fades up 15 frames later
- Floating particles + lens flare orb in background
- Light leak or crossfade transition out

**Pattern B: UI showcase in device frame (180-240 frames)**
- \`<FloatingBrowser>\` wrapping a recreated website page with 3D perspective tilt
- Camera slowly zooms in (animated scale 0.95 to 1.1 + translate)
- Animated cursor moves to a key UI element and clicks
- Highlight ring pulses around the feature
- Parallax: browser frame moves slightly faster than background orbs

**Pattern C: Feature zoom callout (150-210 frames)**
- Start with full UI in browser frame, then animated zoom (scale 1 to 2.2) into a specific feature area
- Glassmorphism tooltip/label panel slides in beside the zoomed feature
- Gentle camera drift during hold
- Pull back (scale 2.2 to 1) before scene exits

**Pattern D: Split-screen or card grid (150-210 frames)**
- 2-3 cards stagger in (translateY 60->0 + opacity + 3deg rotate per card, 6-frame gaps)
- Each card: rounded corners, gradient background, soft shadow, hover-lift float (Math.sin)
- Icons/illustrations inside cards have their own spring delays
- Background: blurred orbs + floating particles + corner wash

**Pattern E: Closing CTA (180-300 frames — scale to match brief total duration)**
- Palette-based gradient mesh intensifies (stay within colors from the brief)
- Product name scales up with shimmer gradient text effect (animated background-position)
- CTA button slides in with spring + animated glow shadow
- Logo pops with rotation + scale spring
- Floating particles increase density, pulsing rings

### Required techniques per scene
Every scene MUST have:
1. **Gradient or mesh background** using **colors from prompt.md** (site palette / CSS values the brief extracted)—not unrelated stock gradients. Avoid flat, depthless slabs. Let the mesh **drift slowly** (sin/cos on stops or position) for smooth visual interest.
2. **Decorative mid-layer** (particles, orbs, rings, washes, or lens flares) with **gentle eased** motion, not jittery linear steps.
3. **Staggered entrance** (4-10 frame offset per element) with **springs or ease-out**---one hero element leads, others follow.
4. **Multi-property animation** (min 2 properties: opacity+translateY, scale+opacity+rotate, etc.) with **non-linear** interpolation where it reads on screen.
5. **Continuous ambient motion** (floating particles, orb drift, gentle parallax) for the whole visible duration of the scene.
6. **Exit animation** in the last 15-22 frames (**ease-in** opacity + subtle scale to 0.95-0.97, or brief push toward the next scene)

### Required techniques per video
The full video MUST include at least:
1. **One scene with a \`<BrowserFrame>\` or \`<FloatingBrowser>\`** showing the app UI in 3D perspective
2. **One camera motion** (zoom in, pan, or pull-back reveal)
3. **Smooth transitions between ALL scenes** (\`springTiming\` + crossfade / soft wipe / light leak --- NEVER hard cuts; avoid abrupt linear 10–12f snaps unless the brief is explicitly punchy)
4. **Word-by-word staggered text** for at least one headline
5. **Varied layouts** across scenes (no two scenes should use the same layout pattern)

### CSS quality bar
- Prefer values **stated in prompt.md** for this capture. When the brief is silent on a token, fall back to sensible defaults.
- Cards (example defaults only): \`borderRadius: 22, boxShadow: "0 18px 40px -12px rgba(0,0,0,0.22)", background: "linear-gradient(...)"\`
- Glassmorphism: \`backdropFilter: "blur(16px)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)"\`
- Buttons: \`borderRadius: 14, background: "linear-gradient(135deg, ...)", boxShadow: "0 12px 28px -12px ..."\`
- Inputs: \`borderRadius: 14, border: "1px solid rgba(...)", background: "rgba(255,255,255,0.65)"\`
- 3D perspective: \`perspective: 1200\` on parent, \`transform: rotateX(...) rotateY(...)\` on child, \`transformStyle: "preserve-3d"\`

### Typography
- The package \`@remotion/google-fonts\` is installed in this monorepo. Import supported families as \`@remotion/google-fonts/<FontName>\` (e.g. \`Outfit\`, \`Inter\`). If you need a font not in that package, use a system stack instead.
- Type scale: display 48-80px, body 15-18px, labels 11-14px uppercase
- Word-by-word stagger for headlines

### Motion and pacing
- **Total runtime** must match **prompt.md** (\`## Assumptions\`, master timeline, scene frame ranges). Convert seconds × FPS consistently; **do not** impose a fixed 60-120s if the brief specifies another length.
- Per-scene frame counts in the pattern examples below (e.g. 150-300 frames) are **typical for a long promo**—**scale** scene durations and scene count so the **sum** equals the brief's total (shorter videos = fewer frames per scene or fewer scenes, as appropriate).
- Each scene should still have enough time for entrance, hold, ambient motion, and exit at the scale the brief demands.
- Use \`<Series>\` / \`<Series.Sequence>\` with exact duration sums, or \`<Sequence from={offset}>\` with crossfade overlaps.
- \`spring()\` for organic UI entrances; \`interpolate() + Easing\` for cameras, cursor paths, and exits---prioritize **smooth, readable** motion over busy linear tweens.

### Scene flow --- logical story
Scenes MUST follow a logical narrative arc, not appear random:
1. **Opening hook** --- dramatic brand intro, sets visual tone
2. **Problem / context** --- what challenge does the user face?
3. **Product reveal** --- first time showing the app UI in a device frame
4. **Feature walkthrough** --- one feature per scene, in logical order, most important first
5. **Results / proof** --- outcomes, stats, or before/after
6. **Closing CTA** --- call to action, logo, tagline

Each scene must logically lead into the next. Think guided tour, not random slides.

### Claims vs motion
Voiceover and supers must stay **consistent** with the product story: do not animate text that implies **X caused Y** unless the brief establishes that relationship. Visual emphasis (glow, zoom, punch) should land on **the claim being supported**, not on empty hype.

### Additional scene patterns (use when prompt.md calls for them)

**Pattern F: Metric dashboard / social proof (150-240 frames)**
- Dark/gradient background with glassmorphism stat cards
- MetricCounter components that count from 0 to target with spring physics
- Stagger cards with 6-8 frame delays, enter from bottom with opacity + translateY
- Optional bar charts or progress bars growing alongside
- Ambient: orbit rings, floating particles, subtle grid pattern

**Pattern G: Workflow / how-it-works (180-300 frames)**
- Step numbers or animated icons enter left-to-right with connecting arrow lines
- Each step has typewriter text label
- Connecting lines animate via stroke-dashoffset
- Mini device frames at each step showing relevant UI
- Background: gradient mesh with subtle dot grid overlay

**Pattern H: Testimonial / social proof quote (120-180 frames)**
- Quote text fades in word-by-word with gentle spring
- Attribution (name, title) slides up after quote finishes
- Star rating fills sequentially
- Glassmorphism card wrapping the testimonial
- Large quotation mark watermark at ~5% opacity behind

**Pattern I: Before / after comparison (150-240 frames)**
- Split screen with animated sliding divider (clip-path or translateX)
- Before side: desaturated/dimmed treatment
- After side: vibrant, product-applied state
- Labels spring in from top with stagger
- Divider handle: glowing dot that pulses

### Notification toasts (for demonstrating real-time features)
Use animated toast notifications sliding in from the right with spring physics, holding briefly, then sliding out. Stack 2-3 toasts with vertical offset to show activity. Great for chat apps, dashboards, or any real-time product.

### Confetti celebrations (for milestone moments)
Burst of 30-50 colorful pieces with physics-based gravity and rotation, triggered at key moments (sign-up, achievement). Keep to 1-2 seconds, use brand colors.

### Metric counters (for data-heavy scenes)
Animate numbers from 0 to target using \`spring()\` with \`damping: 20, stiffness: 40\`. Format with \`.toLocaleString()\`. Use \`fontVariantNumeric: "tabular-nums"\` for stable layout during animation.

### Orbit ring decorations
2-3 dashed/dotted SVG circles rotating slowly (\`frame * 0.3\` deg) around device frames or logos. Different sizes, speeds, and dash patterns. Opacity ~0.12-0.15 for subtlety.

### Anti-patterns (output WILL be rejected)
1. Text on a solid-color background with no depth
2. All elements appearing simultaneously
3. Hard cuts between scenes (unless \`prompt.md\` explicitly demands punchy cuts, e.g. fast-paced with stated overlap limits)
4. **Blocky motion**: stepped opacity/transform, or hero elements popping in **≤3 frames** with no easing
5. No browser/device frames in the entire video
6. Static scenes with no ambient motion
7. Same layout repeated for every scene
8. No exit animations
9. No camera motion in the entire video
10. Generic fonts with no hierarchy
11. Ignoring the site's real colors/fonts/layout
12. **Calling .split()/.trim() on a prop without a default** --- this is the #1 crash cause
13. **Missing defaultProps in \`<Composition>\`** --- render will crash on frame 0
14. **Components that crash when rendered with zero props**
15. **Throwing \`Error\` on duration / frame count mismatch** --- use one exported duration constant + correct \`durationInFrames\` instead

## JSON output shape (required keys)

**You MUST use \`content_b64\` for every \`.ts\` / \`.tsx\` file** (UTF-8 base64 of the full source). Raw \`content\` for TSX is rejected by the server. Output only the base64 string, no data-URL prefix.

Per file:
- \`{ "path": "packages/remotion/src/Main.tsx", "content_b64": "<base64>" }\` **(required for .ts/.tsx)**

Example (shape only):
{
  "compositionId": "Main",
  "summary": "1-3 sentences",
  "files": [
    { "path": "packages/remotion/src/Root.tsx", "content_b64": "aW1wb3J0IFJlYWN0Li4u" }
  ],
  "notes": "optional",
  "renderSuggestion": "optional"
}

Every \`files[].path\` must be normalized with forward slashes and must start with \`packages/remotion/\`.
\`compositionId\` must match the \`id\` prop of the primary \`<Composition>\` you wire in \`Root.tsx\` (letters, numbers, underscore, hyphen; start with a letter).
`;

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

function parseAgentJson(content) {
  const parsed = parseLlmJsonObject(content);
  if (!parsed.ok) {
    return {
      error: parsed.error || "Model did not return valid JSON",
      parseAttempts: parsed.attempts,
    };
  }
  return { ok: true, data: parsed.data };
}

function validatePayload(data) {
  if (!data || typeof data !== "object") return "Invalid payload shape";
  if (typeof data.compositionId !== "string" || !/^[A-Za-z][A-Za-z0-9_-]*$/.test(data.compositionId)) {
    return "compositionId must be a non-empty identifier (start with letter; letters, numbers, _, -)";
  }
  if (typeof data.summary !== "string") return "Missing string summary";
  if (!Array.isArray(data.files)) return "Missing files array";
  for (let i = 0; i < data.files.length; i++) {
    const f = data.files[i];
    if (!f || typeof f !== "object") return "Invalid file entry";
    if (typeof f.path !== "string") {
      return "Each file needs a path string";
    }
    const p = f.path.replace(/\\/g, "/");
    if (!p.startsWith("packages/remotion/")) {
      return `File path must start with packages/remotion/: ${p}`;
    }
    const b64 = f.content_b64;
    const plain = f.content;
    const mustB64 = /\.(tsx|ts)$/i.test(p);
    if (typeof b64 === "string" && b64.trim()) {
      try {
        f.content = Buffer.from(b64.trim(), "base64").toString("utf8");
        delete f.content_b64;
      } catch {
        return `File ${i} (${p}): invalid content_b64 (bad base64)`;
      }
    } else if (mustB64) {
      return `File ${i} (${p}): content_b64 is required for .ts/.tsx — raw "content" strings break JSON on quotes and backslashes`;
    } else if (typeof plain === "string") {
      // non-TS files only (rare)
    } else {
      return `Each file needs content_b64 or content string: ${p}`;
    }
  }
  return null;
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  const backend = resolveRemotionCodingBackend();
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (backend === "anthropic" && !anthropicKey) {
    return jsonResponse(501, {
      ok: false,
      error:
        "ANTHROPIC_API_KEY is not configured for the Remotion coding agent. Set it in .env or Netlify, or set REMOTION_CODING_AGENT_PROVIDER=openai with OPENAI_API_KEY.",
      code: "missing_anthropic_key",
    });
  }
  if (backend === "openai" && !openaiKey) {
    return jsonResponse(501, {
      ok: false,
      error:
        "OPENAI_API_KEY is not configured, or set ANTHROPIC_API_KEY to use Claude for the Remotion coding agent.",
      code: "missing_openai_key",
    });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { ok: false, error: "Invalid JSON body" });
  }

  const promptMd = typeof body.promptMd === "string" ? body.promptMd : "";
  if (!promptMd.trim()) {
    return jsonResponse(400, { ok: false, error: "Body must include non-empty promptMd" });
  }

  const voiceMd = typeof body.voiceMd === "string" ? body.voiceMd : "";
  const soundMd = typeof body.soundMd === "string" ? body.soundMd : "";
  const includeVideo = body.includeVideo !== false;
  const includeAudio = body.includeAudio !== false;

  let skillContext;
  try {
    skillContext = buildRemotionSkillContext();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonResponse(500, {
      ok: false,
      error: msg,
      code: "skill_load_failed",
    });
  }

  const systemContent = `${BASE_SYSTEM}\n\n---\n\n# Vendored Remotion skill (full text)\n\n${skillContext}`;

  const userPayload = {
    instruction:
      "Implement the prompt.md below as Remotion source files. Follow EVERY scene, in order, with the exact durations, text, colors, animations, and transitions described. Output a single JSON object only (no prose before `{`). Use files[].content_b64 for EVERY file (required). Do not use emoji in source; use lucide-react for icons. Paths must start with packages/remotion/.",
    promptMd,
    voiceMd: includeAudio && voiceMd ? voiceMd : undefined,
    soundMd: includeAudio && soundMd ? soundMd : undefined,
    mediaOptions: {
      includeEmbeddedVideo: includeVideo,
      includeAudioTracks: includeAudio,
    },
  };

  const userMessage = JSON.stringify(userPayload);
  let content = "";
  let modelUsed = "";
  let provider = backend;

  try {
    if (backend === "anthropic") {
      modelUsed = process.env.REMOTION_CODING_AGENT_ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
      const maxTok = Math.min(
        128_000,
        Math.max(4096, resolveMaxOutputTokens())
      );
      const { text, stopReason } = await anthropicCompleteText({
        apiKey: anthropicKey,
        model: modelUsed,
        system: systemContent,
        userText: userMessage,
        maxOutputTokens: maxTok,
      });
      content = text;
      if (stopReason === "max_tokens") {
        return jsonResponse(200, {
          ok: false,
          error: `Claude output was truncated (hit max_tokens=${maxTok}). Try a shorter prompt.md, fewer scenes, or raise REMOTION_CODING_AGENT_MAX_OUTPUT_TOKENS (capped at 128000).`,
          code: "truncated",
        });
      }
    } else {
      modelUsed = process.env.REMOTION_CODING_AGENT_MODEL || DEFAULT_OPENAI_MODEL;
      const maxOutputTokens = effectiveMaxOutputTokens(modelUsed);
      const client = new OpenAI({ apiKey: openaiKey });
      const completion = await withOpenAiRateLimitRetry(
        () =>
          client.chat.completions.create(
            chatCompletionBody(modelUsed, {
              model: modelUsed,
              temperature: 0.25,
              max_tokens: maxOutputTokens,
              response_format: { type: "json_object" },
              messages: [
                { role: "system", content: systemContent },
                {
                  role: "user",
                  content: userMessage,
                },
              ],
            })
          ),
        { label: "remotion-coding-agent", maxAttempts: 8 }
      );
      const choice = completion.choices[0];
      content = choice?.message?.content ?? "";
      if (choice?.finish_reason === "length") {
        return jsonResponse(200, {
          ok: false,
          error: `Model output was truncated (hit max_completion_tokens=${maxOutputTokens}). Try a shorter prompt.md, fewer scenes, or set REMOTION_CODING_AGENT_MAX_OUTPUT_TOKENS up to ${MAX_OUTPUT_TOKENS_CAP} (if your model tier allows it).`,
          code: "truncated",
        });
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = e?.status ?? e?.response?.status;
    if (status === 429) {
      return jsonResponse(429, {
        ok: false,
        error: msg,
        code: backend === "anthropic" ? "anthropic_rate_limit" : "openai_rate_limit",
        hint:
          backend === "anthropic"
            ? "Anthropic rate limit after retries. Wait and retry, or try REMOTION_CODING_AGENT_ANTHROPIC_MODEL=claude-sonnet-4-6 (or haiku) for lower load."
            : "OpenAI rate limit after automatic retries. Wait a minute and try again.",
      });
    }
    if (backend === "anthropic") {
      const notFound = status === 404 || /not_found|invalid_model|model:/i.test(msg);
      if (notFound) {
        return jsonResponse(400, {
          ok: false,
          error: msg,
          code: "anthropic_model_not_found",
          hint:
            "Set REMOTION_CODING_AGENT_ANTHROPIC_MODEL to a model your key can use (e.g. claude-sonnet-4-6, claude-opus-4-6).",
        });
      }
      return jsonResponse(200, { ok: false, error: msg, code: "anthropic_error" });
    }
    return jsonResponse(200, { ok: false, error: msg, code: "openai_error" });
  }

  const parsed = parseAgentJson(content);
  if (!parsed.ok) {
    const attempts = parsed.parseAttempts || [];
    const hint =
      attempts.length > 0
        ? `JSON.parse hints: ${attempts.slice(0, 3).join(" · ")}`
        : "The model may have added text outside JSON or truncated output. Retry, shorten prompt.md, or try a different REMOTION_CODING_AGENT_* model.";
    return jsonResponse(200, {
      ok: false,
      error: parsed.error || "Parse error",
      hint,
      raw: content.slice(0, 2000),
      code: "bad_json",
    });
  }

  const validationError = validatePayload(parsed.data);
  if (validationError) {
    return jsonResponse(200, {
      ok: false,
      error: validationError,
      raw: parsed.data,
      code: "validation_failed",
    });
  }

  return jsonResponse(200, {
    ok: true,
    model: modelUsed,
    provider,
    compositionId: parsed.data.compositionId,
    summary: parsed.data.summary,
    files: parsed.data.files,
    notes: typeof parsed.data.notes === "string" ? parsed.data.notes : "",
    renderSuggestion:
      typeof parsed.data.renderSuggestion === "string"
        ? parsed.data.renderSuggestion
        : "",
  });
}
