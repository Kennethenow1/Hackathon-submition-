import OpenAI from "openai";
import { corsHeaders } from "./lib/cors.mjs";
import { chatCompletionBody } from "./lib/openai-chat-params.mjs";
import { withOpenAiRateLimitRetry } from "./lib/openai-retry.mjs";
import { runAnthropicGeneratingLoop } from "./lib/generating-agent-anthropic.mjs";
import { parseLlmJsonObject } from "./lib/parse-llm-json.mjs";

const SLICE_MAX_CHARS = 14_000;
const MAX_TOOL_ROUNDS = 22;

/**
 * Default generating backend is OpenAI (gpt-5.4). Override with GENERATING_AGENT_MODEL.
 * Set GENERATING_AGENT_PROVIDER=anthropic for Claude, or omit provider and set only ANTHROPIC_API_KEY
 * (no OPENAI_API_KEY) to use Claude automatically.
 */
const DEFAULT_OPENAI_MODEL = "gpt-5.4";

/**
 * OpenAI phase 2: timed voice_md + sound_md only (cheaper model, one JSON completion).
 * Override with GENERATING_AGENT_VOICE_SOUND_MODEL (e.g. gpt-4o-mini).
 */
const DEFAULT_OPENAI_VOICE_SOUND_MODEL = "gpt-4o-mini";

/**
 * Anthropic generating agent — override with GENERATING_AGENT_ANTHROPIC_MODEL.
 * Default Sonnet saves credits vs Opus; use claude-opus-4-6 for production quality, claude-haiku-4-5 for cheapest testing.
 */
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

/** Max completion tokens for the voice/sound JSON pass (enough for long promos). */
const VOICE_SOUND_MAX_COMPLETION_TOKENS = 16_384;

function resolveGeneratingBackend() {
  const p = (process.env.GENERATING_AGENT_PROVIDER || "").trim().toLowerCase();
  if (p === "openai") return "openai";
  if (p === "anthropic") return "anthropic";
  const openaiKey = (process.env.OPENAI_API_KEY || "").trim();
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  // No provider set: use whichever key is available (Netlify often has only one).
  if (!openaiKey && anthropicKey) return "anthropic";
  return "openai";
}

const SYSTEM = `You are the **Generating agent** for a promo-video pipeline. The user has captured a front-end (HTML/CSS/JS) and a structural navigation draft. Your job is to produce **four markdown documents** for downstream tooling:

1. **ideas_md** -- A **video concept brief** with creative ideas, narrative angle, key selling points, and script outline. This is the creative brainstorm that shapes everything else.
2. **voice_md** -- A timed **voiceover script** aligned to a single continuous timeline (seconds).
3. **sound_md** -- **Sound effects / design** cues on the same timeline (seconds), with clear labels.
4. **prompt_md** -- A **precise production brief** for a **Remotion** rendering agent: timeline in **frames** (state assumed FPS), scene cuts, what to show from the site, which promotion effects to use, and how audio lines up.

## Rules
- Use the tools to read the bundle; do not invent DOM details -- ground copy in **navigation_md** and **site** slices.
- Respect the user's **vision**, **video_spec** (if provided), and **selected effects** when choosing pacing, length, and emphasis.
- Prefer concise, actionable wording. Use metric timestamps (seconds) in voice/sound tables; use frames in the Remotion brief (derive frames from seconds using the FPS you state).
- When the site HTML is large, read it in slices until you understand layout/sections; combine with navigation_md.
- When finished, call **submit_generating_outputs** exactly once with all four markdown strings.
- **START with ideas_md** — brainstorm the concept FIRST, then build voice/sound/prompt from that concept.

## Required shapes (must follow)

### ideas_md
- Title: \`# Video Concept & Script Ideas\`
- Sections (use these headings):
  - \`## Creative angle\` — 2-3 sentences: what is the narrative hook? What emotion should the viewer feel? What makes this product interesting? (e.g. "We position Collato as the antidote to context-switching chaos — the viewer feels relief and empowerment when they see how fast AI handles their tedious tasks.")
  - \`## Target audience\` — who is this video for? (e.g. "Product managers at mid-size SaaS companies who are drowning in documentation and cross-tool searching")
  - \`## Key selling points\` — bullet list of 3-6 product benefits, ordered by importance. Each should be a concise value statement, not a feature name. (e.g. "Draft release notes in seconds, not hours" instead of "AI writing")
  - \`## Narrative arc\` — the story structure for the video:
    - **Hook**: What grabs attention in the first 3 seconds? (bold claim, relatable pain point, surprising stat)
    - **Problem**: What frustration does the viewer relate to?
    - **Solution reveal**: How and when do we introduce the product?
    - **Proof points**: What features/demos/stats build credibility?
    - **Closer**: What is the final call-to-action and emotional takeaway?
  - \`## Script outline\` — table with columns: \`Scene #\` | \`Duration (s)\` | \`Visual concept\` | \`Voiceover gist\` | \`Key effect\`
    - This is NOT the detailed Remotion brief — it's the creative spine. Each row is 1-2 sentences describing the visual idea and what the narrator says.
  - \`## Tone & style notes\` — describe the visual and audio mood (e.g. "Clean, modern, slightly playful. Think Stripe meets Loom. Background music: upbeat lo-fi electronic, not corporate. Voiceover: conversational, not salesy.")
  - \`## Alternative angles\` — suggest 2 alternative creative approaches the user could consider (e.g. a "day in the life" angle vs. a "before/after" angle vs. a "product tour" angle). Keep these to 2-3 sentences each.

### voice_md
- Title: \`# Voiceover\`
- Opening line: state **target duration** (seconds)—aligned with **vision** / **video_spec** when provided, otherwise state the default you chose and why—and **word count** estimate.
- Then a **markdown table** with columns: \`Start (s)\` | \`End (s)\` | \`Script\` | \`Delivery notes (optional)\`
- Rows in chronological order; no overlapping rows unless intentional (e.g. layered VO -- then note it).
- **Script**: write like natural speech (short phrases, commas where you want tiny pauses). Avoid markdown in cells. Use semicolons or em-dashes only when a slightly longer pause fits the line.
- **Delivery notes**: steer TTS energy (not spoken). Examples: \`upbeat, punchy\`, \`calm, warm pause before the CTA\`, \`dramatic, slow\`, \`pause before numbers\`. These tune ElevenLabs pacing and expressiveness when voiceover is synthesized.

### sound_md
- Title: \`# Sound design\`
- Table: \`Start (s)\` | \`End (s)\` | \`Cue\` | \`Description\` | \`Mix notes (optional)\`
- Cues may reference SFX libraries conceptually (whoosh, click, riser) -- no file paths required.

### prompt_md
- Title: \`# Remotion production brief\`
- Sections (use these headings):
  - \`## Summary\`
  - \`## Assumptions\` (FPS, composition size if inferable, **total duration** in seconds and frames—must match the user's requested length when stated in vision/video_spec)
  - \`## Master timeline\` -- table: \`Start (s)\` | \`End (s)\` | \`Start (frames)\` | \`End (frames)\` | \`Beat / purpose\`
  - \`## Scenes\` -- numbered scenes; each with all subsections below
  - \`## Promotion effects\` -- list selected effect **ids** and how/when to apply them
  - \`## Assets & capture\` -- what from \`site.html\` / CSS matters (selectors or descriptions from navigation draft)
  - \`## Handoff checklist\` -- bullet list the Remotion agent must verify before render

## CRITICAL: Target quality = Google product ads + startup launch videos

The Remotion coding agent will produce videos matching the quality of **Google product ads** (e.g. "Introducing Google Vids") and **best-in-class startup launch videos** (e.g. Collato Product Hunt video by Burnwe, Stripe product pages, Linear launch videos). Key qualities:
- Floating 3D UI mockups, cinematic camera motion, parallax, light leaks, device frames, and cursor animations
- **Problem → Solution → Proof** narrative arc (like Collato: opens with relatable pain, introduces product, demos features one-by-one, closes with CTA)
- **One feature per scene** with clear visual focus (not cramming multiple features into one scene)
- **Kinetic typography** for key phrases and headlines
- **Metric counters** and animated stats for social proof scenes
- **Consistent brand palette** throughout (derived from the captured site)
- **Smooth transitions** between every scene (light leaks, **longer eased crossfades**, \`springTiming\`-style overlaps — avoid hard cuts and **snappy** 10–12 frame linear slides unless the user asked for aggressive pacing)

Your brief must describe scenes at this level so the coding agent can produce that quality.

## CRITICAL: Motion — smooth, eye-catching, never stiff

The video must feel **premium and alive**, not like a slide deck. In **prompt_md** (especially **Animation** and **Transition** subsections), spell out motion that is:

- **Smooth**: prefer **springs** or **ease-out / ease-in-out** curves for entrances, camera moves, and cursor paths---avoid harsh linear snaps unless you want a deliberate glitch beat. Give moves enough **frames** to read (no 3-frame pops for hero elements).
- **Eye-catching**: **one clear focal point** per beat (headline, device, or CTA) gets the boldest motion; supporting elements use **staggered** smaller motion so the eye is guided. Use **micro-motion** during holds (gentle float, slow parallax, soft glow pulse, gradient drift) so frames never look frozen.
- **Layered**: overlap actions slightly (e.g. background mesh drifts while UI springs in) so the composition feels continuous.
- **Cursor & camera**: cursor paths should **ease** near the target; camera zoom/pan should **ramp** in and out, not jump.

When you describe choreography, name the **feel** where it helps (e.g. "snappy but smooth spring landing", "slow cinematic push-in").

## CRITICAL: Animation logic — continuous motion, not blocky or contradictory

The Remotion agent must be able to implement motion that **reads as one continuous film**, not a stack of disconnected slides:

- **No blocky choreography**: do not specify motion as abrupt on/off toggles (e.g. "visible frame 0, hidden frame 1" for hero elements). Give **minimum frame spans** for each beat (entrances **≥8–12 frames** at 30fps for primary UI unless fast-paced style says otherwise; transitions **≥22–32 frames** overlap for standard pacing). Describe **easing** (spring, ease-out, ease-in-out), not just start/end states.
- **Cause before effect in time**: if the narrative says the user *clicks* then *sees* a result, the brief must order animations the same way (cursor lands → feedback → outcome). Do not describe the highlight ring before the target element has entered.
- **One continuous idea per beat**: stagger related elements so motion **supports** the spoken line (e.g. stat label eases in, then number counts—**not** both popping on the same frame unless fast-paced explicitly calls for a single punch).
- **Avoid logical contradictions in the brief**: scene goals must not conflict (e.g. "minimal, calm scene" + "maximum particle chaos"); resolve tension in **## Assumptions** or pick one direction.

## CRITICAL: Honest copy — no logical fallacies in voice or on-screen text

Ground all claims in **what the captured site and navigation actually say**. The video is a promo, not a debate club—but **bad reasoning** undermines trust.

- **No false dichotomies** ("either X or failure") unless the product copy literally frames it that way.
- **No fake causation**: do not imply "because you used this product, outcome Y **always** happens" unless the site provides that guarantee. Prefer **capability** language ("helps you…", "lets you…") over **inevitable** outcomes.
- **No bandwagon / vague authority** ("everyone knows", "industry-leading") without something concrete from the capture (named integration, metric, customer type).
- **No straw-man competitors** or unnamed "other tools" unless the brief is explicitly comparative and grounded in site messaging.
- **Superlatives and absolutes** ("best", "only", "never", "always"): use only when the site's own headline or body supports them; otherwise soften or cut.
- In **prompt_md**, list **exact headline/tagline strings** for on-screen text so the Remotion agent does not invent stronger claims than the generating agent approved.

## CRITICAL: Video duration comes from the user (vision + video_spec), not a fixed default

- Call **get_user_vision_and_effects** early. Use **video_spec** and **vision** for **target duration** (seconds or minutes), pacing, and any hard limits (e.g. "30s social cut", "90s walkthrough").
- If the user states a target length, **honor it**: voice_md, sound_md, and prompt_md must use that **total runtime** (tables and frame math must add up at the FPS you state in Assumptions).
- If they give a **range** (e.g. 60-90s), pick a concrete number inside the range and say which you chose in **## Assumptions**.
- If they **omit** length entirely, choose one professional default (typically **60-90 seconds** for a full promo) and **state it explicitly** in Assumptions and the voiceover opening line—do not imply it was user-mandated.
- Scale **scene count** and **per-scene frame ranges** to the total duration (aim for a major beat about every **5-12 seconds** unless the user specifies otherwise). Do not use a fixed scene count that ignores a short or long target.

## CRITICAL: Scenes must tell a logical story

Structure scenes as a **narrative arc** that makes visual and logical sense:

1. **Opening hook** (Scene 1): Grab attention --- bold product name, dramatic entrance, sets the visual tone using **colors taken from the captured site** (not arbitrary palettes).
2. **Problem / context** (Scene 2): What challenge does the user face? Show pain point or status quo briefly.
3. **Product introduction** (Scene 3): Reveal the product UI in a device frame. This is the first time the viewer sees the actual app.
4. **Feature walkthrough** (Scenes 4-8+): Walk through key features ONE AT A TIME in logical order. Each scene focuses on ONE feature. Show the actual UI for that feature, highlight the interaction, explain the benefit. Order features from most important to least.
5. **Social proof / results** (Scene near end): Show outcomes, stats, testimonials, or a "before vs after" comparison.
6. **Closing CTA** (Final scene): Call to action, logo, tagline, website URL.

Scene-to-scene transitions must feel natural --- each scene should logically follow from the previous one. Think of it as a guided tour, not random slides.

## CRITICAL: Scene descriptions must include ALL subsections below

Each scene in \`## Scenes\` MUST include ALL of these subsections:

### 1. Scene type (pick one per scene, vary across the video)
- **Hero intro**: **palette-derived** gradient or mesh (built from the site's own colors), word-by-word product name, tagline, particles
- **UI showcase in device frame**: website page inside a \`<FloatingBrowser>\` with 3D perspective tilt, camera zoom, cursor animation
- **Feature zoom callout**: zoom from full page into a specific feature area, glassmorphism label panel
- **Card/feature grid**: staggered animated cards with hover-lift float, icons with own spring delays
- **Closing CTA**: **brand-tinted** gradient intensifies (from site palette), shimmer text, CTA button with glow, logo pop

Use at least 3 different scene types in a single video. NEVER use the same type for every scene.

### 2. Layout description
Describe the exact spatial layout. Examples:
- "Website page inside a FloatingBrowser (rotateX=-8, rotateY=12) centered on screen, **background gradients using the site's primary and surface colors** (values quoted from CSS)"
- "Left-aligned hero text (55% width) + right side: 3 floating animated cards"
- "Full-page UI in browser frame, camera zooms into the form section at 60% from top"
- "Split screen: before state on left, after state on right, animated divider wipe"

### 3. CSS styling from captured site
Extract and specify EXACT CSS properties from the captured HTML/CSS for the Remotion agent (read real values from the bundle—**do not invent** a separate aesthetic):
- **Backgrounds**: quote **actual** colors and gradients from the site (body, main wrappers, \`:root\` / CSS variables, hero sections). For **full-frame or mesh backplates** behind the UI, **derive** tints and gradients **from that palette** (e.g. soften the brand primary for a wash, or interpolate between two colors already on the page). The examples \`#eac6c0\`, \`linear-gradient(145deg, #fff5f3, #f5d4d0)\` are **illustrative of format only**—your brief must tie back to **this** site's tokens/hex/rgb.
- Cards: border-radius, box-shadow, border, padding, background
- Typography: font families, sizes, weights, colors, letter-spacing, line-height
- Buttons: padding, border-radius, background gradient, shadow, text color
- Form inputs: border, background, border-radius

### 4. Animation choreography (per-element, with frame numbers)
For EACH visual element, specify motion that is **smooth and attention-grabbing** (springs / easing, staggered hierarchy, ambient drift on holds):
- Entrance type and frame offset: "word-by-word stagger, frame 6-14, per-word spring 4-frame gap" or "ease-out slide from bottom, frame 0-14, translateY 48->0 + opacity"
- Any continuous motion: "gentle sine float (8px vertical)", "slow rotation", "camera ease-in-out zoom scale 0.95->1.08 over 140 frames"
- Exit: "frames 135-150, ease-in opacity fade + subtle scale to 0.97"
- Cursor path (if UI showcase): describe **which UI element** is clicked and **relative placement** (e.g. "center of the primary CTA in the right card grid"). The Remotion agent must **derive (x,y) from the same layout math as that element**—not unrelated pixel literals—and use \`arrowTipOffsetPx\` + \`CURSOR_ARROW_PATH_D\` from \`packages/remotion/src/cursorTipOffset.ts\` (tip = target point, never duplicate the SVG \`d\` string).

### 5. Decorative and depth layers
Specify THREE layers:
- **Background**: gradient mesh or radial washes using **3-4 colors chosen from the site's palette** (name the source: e.g. "from \`--accent\` and hero gradient stop #…"). Avoid unrelated stock gradients unless the user asks for a deliberate contrast.
- **Mid-layer**: floating particles (count, **accent from site**), blurred orbs, rotating dashed SVG rings, lens flare, pulsing rings
- **Foreground**: the main content (browser frame, cards, text)

### 6. Transition to next scene
Prefer **smooth overlaps** (eased opacity, slight motion blur feel via scale)---never a dead hard cut unless the user asks.
- Crossfade: "**24-32 frame** overlap with **springTiming** + \`fade()\` in Remotion (or equivalent eased opacity) + subtle scale 1->1.02"
- Light leak: "LightLeak overlay, 30-40 frames, hueShift=240, ease-in-out"
- Slide: only if the brief wants energy; otherwise prefer fade --- "ease-out slide from-right, **28+ frames**" if used
- Feature zoom: "ease-in-out zoom scale 1->2.2, hold 40 frames, ease-out pull back"

### Full example scene:

\`\`\`
### Scene 2: App landing page in device frame (frames 120-270 — illustrative; scale frame ranges to the user's target duration)
**Type:** UI showcase in device frame
**Goal:** Show the real app landing page floating in 3D space with a cursor interaction.
**Layout:** FloatingBrowser (rotateX=-8, rotateY=12, scale=0.85) centered. Inside: recreated home page (eyebrow, headline, 3 cards). **Backdrop:** gradient mesh built from **this site's** primary, surface, and accent colors (list the hex/rgb you read from CSS).
**CSS from site:**
- Page bg: [actual value from capture, e.g. body or \`--background\`]
- Eyebrow: [actual font stack, size, weight, color from capture]
- Headline: [actual typography from capture]
- Cards: [actual border-radius, background, shadow, border from capture]
- Card labels: [actual label styles from capture]
**Animation:**
- Frame 0-20: FloatingBrowser springs in from below (translateY 120->0, scale 0.7->0.85, opacity 0->1)
- Frame 8-18: Inside browser, eyebrow slides up + fades
- Frame 12-22: Headline words stagger (per-word spring, 4-frame gaps, translateY 40->0)
- Frame 18-30: Cards stagger in (6-frame gaps, translateY 60->0, rotate 3->0deg)
- Frame 30+: Cards float (Math.sin * 8px), browser drifts gently (Math.sin * 3px)
- Frame 40: Cursor eases from a rest position over the left column toward the **center of the highlighted language card** (coordinates derived from that card’s layout box + \`arrowTipOffsetPx\`), clicks frame 57
- Frame 57: Highlight ring springs around clicked card
- Frame 70: Camera starts slow zoom (scale 0.85->1.0 over 60 frames)
- Frame 135-150: Everything fades + scales to 0.97
**Decorative:** Gradient mesh from the site's palette (4 orbiting radial gradients tinted from captured colors), floating particles (18, accent = site's accent hue), 2 lens flare orbs tinted to match
**Transition:** 28-frame spring-eased crossfade into Scene 3
\`\`\`

This level of detail is REQUIRED for every scene. The Remotion agent has a pre-built \`<BrowserFrame>\` and \`<FloatingBrowser>\` component. Reference them by name in your brief.

## Available promotion effects (from the effects catalog)

The user may select any of these effects. When they do, incorporate them naturally into the scenes. The Remotion coding agent knows how to implement all of these:

- **floating-3d-ui**: App UI floats in 3D space with perspective tilt and sine drift
- **cinematic-zoom-pan**: Slow camera push-in or pan with cubic bezier easing
- **feature-zoom-callout**: Smooth zoom into a specific feature area with glassmorphism label
- **staggered-card-grid**: Cards animate in one-by-one with spring physics
- **word-by-word-kinetic**: Headlines animate word-by-word with spring delays or shimmer
- **gradient-mesh-bg**: Organic gradient background with sin/cos drift (Apple/Stripe style)
- **cursor-interaction**: Animated cursor navigating the UI with click ripples
- **light-leak-transition**: Cinematic light leak overlays between scenes
- **particle-field**: Floating luminous dots with sine-wave drift
- **morphing-shapes**: Geometric shapes morph between states via animated clip-path
- **number-counter-reveal**: Stats count up from zero with spring physics
- **split-screen-compare**: Before/after split with animated divider
- **device-frame-showcase**: Product in browser chrome with 3D perspective
- **parallax-depth-layers**: Three-layer parallax for depth
- **glassmorphism-panels**: Frosted glass panels with backdrop-filter blur
- **icon-animation-burst**: Icons spring in with radial burst ring
- **text-highlight-sweep**: Colored highlight sweeps behind key words
- **orbit-ring-decoration**: Dashed SVG rings rotating around elements
- **slide-reveal-wipe**: Content slides in with eased motion and optional blur focus
- **confetti-celebration**: Colorful confetti burst for milestone moments
- **screen-recording-polish**: Screenshot enhanced with zoom and device frame
- **logo-reveal-spring**: Logo enters with spring bounce and optional glow
- **progress-bar-fill**: Animated progress bar with eased fill
- **notification-toast-pop**: UI toasts slide in from edges with spring physics

Even when effects are not explicitly selected, use at least 5-6 of these techniques to achieve the quality bar.

## Narrative templates (use as starting points for ideas_md)

### "Problem → Product → Proof" (30-60s)
Hook → Pain point → Product reveal → Feature demo → Results → CTA

### "Feature Showcase" (45-90s)
Brand intro → Overview → Feature 1-5 → Integration/workflow → CTA

### "Launch Announcement" (15-30s, Product Hunt style)
Logo burst → One-liner → Quick demo → Social proof → CTA

### "How It Works" (60-120s, explainer)
Problem statement → Step 1 → Step 2 → Step 3 → Summary → CTA
`;

const FAST_PACED_ADDENDUM = `

## VIDEO STYLE: FAST-PACED (user selected this — override defaults)

The user wants a **fast-paced, high-energy** video. Every second must have visible action. Think launch-day hype reels, Product Hunt trailers, and TikTok-style tech demos. Apply ALL of these rules:

### Pacing
- **Shorter scenes**: 3-6 seconds per scene instead of 8-15. Cut faster. No lingering.
- **More scenes**: fit 8-12+ scenes in a 30s video, 15-20+ in a 60s video.
- **Quick transitions**: 6-10 frame crossfades max (not 18-24). Transitions should be snappy, not leisurely.
- **No idle holds**: if a scene has the UI fully visible, start moving something else immediately — zoom, pan, cursor, or cut to next.

### Motion
- **Simultaneous animation**: multiple elements animate at the same time, not one-by-one with long waits. Stagger by 2-3 frames, not 6-8.
- **Always animating**: at every frame, at least 2-3 elements are in motion (background drift, UI float, cursor moving, text entering, etc.).
- **Faster entrances**: spring damping higher (15-20), elements snap into place. Ease durations 8-12 frames, not 20-30.
- **Camera never stops**: constant slow zoom, pan, or parallax drift throughout every scene.
- **Quick cursor**: cursor moves fast (ease-out, 10-15 frames to target) with immediate click feedback.

### Visual density
- **More on screen**: show 2-3 UI elements per scene instead of 1. Feature cards, stats, and labels can overlap and layer.
- **Text bursts**: headlines appear word-by-word with 2-frame gaps (not 4-6). Stats counter runs fast (15 frames, not 40).
- **Particle count up**: more particles (30-50), faster drift, higher opacity.
- **Scale jumps**: occasional quick scale pops (1.0 → 1.05 → 1.0 in 6 frames) for emphasis beats.

### Voiceover pacing
- The voiceover should be **concise and punchy** — short declarative sentences, no filler words.
- Each VO row covers 2-4 seconds max. Delivery notes: "upbeat", "energetic", "punchy".

### What NOT to do
- No 30+ frame fade-ins. No gentle slow builds. No scenes where nothing moves for 1+ seconds.
- Do NOT sacrifice clarity for speed — each feature should still be clearly shown, just faster.

### Still smooth and logical (even when fast)
- **Easing, not stair-steps**: motion stays **eased** (springs, ease-out)—never describe hero elements as instant pop-in with zero ramp. Snappy can still be **smooth** (higher damping, shorter duration).
- **Story order**: keep **cause → effect** and **problem → solution** in the same order as the standard brief; speed does not mean random scene order or contradictory beats.
- **Copy**: fast VO must still follow **Honest copy — no logical fallacies** above—punchy is not the same as misleading.
`;

/**
 * OpenAI phase 1: same guidance as SYSTEM but only ideas_md + prompt_md + submit_visual_brief.
 * Phase 2 uses GENERATING_AGENT_VOICE_SOUND_MODEL for voice_md + sound_md (JSON).
 */
const SYSTEM_OPENAI_PHASE1 = SYSTEM.replace(
  "produce **four markdown documents**",
  "produce **two markdown documents** in this pass (phase 1 of 2; a follow-up model will write voice/sound)"
)
  .replace(
    "2. **voice_md** -- A timed **voiceover script** aligned to a single continuous timeline (seconds).\n3. **sound_md** -- **Sound effects / design** cues on the same timeline (seconds), with clear labels.\n4. **prompt_md**",
    "2. **prompt_md**"
  )
  .replace(
    "Use metric timestamps (seconds) in voice/sound tables; use frames in the Remotion brief (derive frames from seconds using the FPS you state).",
    "Use frames in the Remotion brief (derive frames from seconds using the FPS you state). Keep **## Master timeline** in prompt_md in seconds and frames so the next pass can align VO and SFX."
  )
  .replace(
    "When finished, call **submit_generating_outputs** exactly once with all four markdown strings.",
    "When finished, call **submit_visual_brief** exactly once with **ideas_md** and **prompt_md** only (do not output voice_md or sound_md in this phase)."
  )
  .replace(
    "then build voice/sound/prompt from that concept.",
    "then build **prompt_md** from that concept."
  )
  .replace(
    "voice_md, sound_md, and prompt_md must use that **total runtime** (tables and frame math must add up at the FPS you state in Assumptions).",
    "**prompt_md** must encode that **total runtime** in **## Assumptions** and **## Master timeline** (seconds ↔ frames consistent). Voice/sound tables will be generated in phase 2 to match."
  )
  .replace(
    "state it explicitly** in Assumptions and the voiceover opening line—do not imply it was user-mandated.",
    "state it explicitly** in **## Assumptions**—do not imply it was user-mandated."
  )
  .replace(
    "### voice_md\n- Title: `# Voiceover`\n- Opening line: state **target duration** (seconds)—aligned with **vision** / **video_spec** when provided, otherwise state the default you chose and why—and **word count** estimate.\n- Then a **markdown table** with columns: `Start (s)` | `End (s)` | `Script` | `Delivery notes (optional)`\n- Rows in chronological order; no overlapping rows unless intentional (e.g. layered VO -- then note it).\n\n### sound_md\n- Title: `# Sound design`\n- Table: `Start (s)` | `End (s)` | `Cue` | `Description` | `Mix notes (optional)`\n- Cues may reference SFX libraries conceptually (whoosh, click, riser) -- no file paths required.\n\n### prompt_md",
    "### prompt_md"
  );

const SYSTEM_VOICE_SOUND_JSON = `You are the **Voice & sound pass** for a promo-video pipeline.

You receive **ideas_md** (concept, tone, script outline) and **prompt_md** (Remotion production brief with **## Assumptions**, **## Master timeline**, and **## Scenes**).

Your job: output **voice_md** and **sound_md** as JSON only. Align all **Start (s)** / **End (s)** to the **same total duration** and beats as prompt_md (Assumptions + Master timeline). Match tone from ideas_md (**## Tone & style notes**, **## Script outline**).

## Required shapes

### voice_md (markdown string value in JSON)
- Title: \`# Voiceover\`
- First line after title: state **target duration** (seconds) and **word count** estimate (must match prompt_md total runtime).
- Then a **markdown table**: \`Start (s)\` | \`End (s)\` | \`Script\` | \`Delivery notes (optional)\`
- Rows in time order; no gaps that contradict the video length unless intentional.
- **Script**: conversational phrasing with natural punctuation (commas / periods) for rhythm. **Delivery notes**: short cues for energy and pauses, e.g. \`energetic\`, \`warm, calm\`, \`pause before stat\` — used by ElevenLabs voice tuning, not read aloud.
- **Reasoning**: do not add false dichotomies, fake causation, or unsupported superlatives beyond what **ideas_md** and **prompt_md** already establish; keep claims aligned with the site's message.

### sound_md (markdown string value in JSON)
- Title: \`# Sound design\`
- Table: \`Start (s)\` | \`End (s)\` | \`Cue\` | \`Description\` | \`Mix notes (optional)\`
- Cues: whoosh, click, riser, ambient bed, etc. (no file paths).

Return a single JSON object with exactly two string keys: \`voice_md\` and \`sound_md\`. No other keys, no markdown fences.`;

const generatingAgentReadTools = [
  {
    type: "function",
    function: {
      name: "get_bundle_metadata",
      description:
        "Returns ids, source URL, created time, and character lengths of html/css/js/navigation without full text.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_user_vision_and_effects",
      description:
        "Returns the user's creative vision text, optional video_spec (target duration, pacing, format), and the promotion effects they selected (from the style manifest). Use these for total runtime and production constraints.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_navigation_md",
      description: "Returns the full navigation / structural draft markdown for the captured site.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_site_html_slice",
      description: "Returns a character slice of site HTML starting at offset (for large documents).",
      parameters: {
        type: "object",
        properties: {
          offset: { type: "integer", description: "Start character index (0-based)" },
          length: {
            type: "integer",
            description: `Max characters to return (capped at ${SLICE_MAX_CHARS})`,
          },
        },
        required: ["offset"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_site_css_slice",
      description: "Returns a character slice of concatenated CSS.",
      parameters: {
        type: "object",
        properties: {
          offset: { type: "integer" },
          length: { type: "integer" },
        },
        required: ["offset"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_site_js_slice",
      description: "Returns a character slice of site JavaScript source if present.",
      parameters: {
        type: "object",
        properties: {
          offset: { type: "integer" },
          length: { type: "integer" },
        },
        required: ["offset"],
      },
    },
  },
];

const submitGeneratingOutputsTool = {
  type: "function",
  function: {
    name: "submit_generating_outputs",
    description:
      "Submit final ideas_md, voice_md, sound_md, and prompt_md. Call once when all four are complete.",
    parameters: {
      type: "object",
      properties: {
        ideas_md: { type: "string" },
        voice_md: { type: "string" },
        sound_md: { type: "string" },
        prompt_md: { type: "string" },
      },
      required: ["ideas_md", "voice_md", "sound_md", "prompt_md"],
    },
  },
};

const submitVisualBriefTool = {
  type: "function",
  function: {
    name: "submit_visual_brief",
    description:
      "Submit phase-1 outputs only: ideas_md and prompt_md. Call once when both are complete. Do not include voice_md or sound_md.",
    parameters: {
      type: "object",
      properties: {
        ideas_md: { type: "string" },
        prompt_md: { type: "string" },
      },
      required: ["ideas_md", "prompt_md"],
    },
  },
};

const toolsGeneratingFull = [...generatingAgentReadTools, submitGeneratingOutputsTool];
const toolsOpenAiVisual = [...generatingAgentReadTools, submitVisualBriefTool];

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

function sliceText(text, offset, length) {
  const src = typeof text === "string" ? text : "";
  const o = Math.max(0, Number(offset) || 0);
  const len = Math.min(
    SLICE_MAX_CHARS,
    Math.max(1, Number(length) || SLICE_MAX_CHARS)
  );
  const content = src.slice(o, o + len);
  return {
    offset: o,
    returnedChars: content.length,
    totalChars: src.length,
    hasMore: o + content.length < src.length,
    content,
  };
}

function runTool(name, args, ctx) {
  const wc = ctx.websiteComponent;
  if (!wc || typeof wc !== "object") {
    return { error: "Missing websiteComponent" };
  }
  switch (name) {
    case "get_bundle_metadata":
      return {
        id: wc.id,
        createdAt: wc.createdAt,
        source: wc.source,
        pageUrl: wc.pageUrl ?? null,
        htmlChars: (wc.site?.html ?? "").length,
        cssChars: (wc.site?.css ?? "").length,
        jsChars: (wc.site?.js ?? "").length,
        navigationMdChars: (wc.navigationMd ?? "").length,
      };
    case "get_user_vision_and_effects": {
      const ids = ctx.selectedEffectIds ?? [];
      const catalog = Array.isArray(ctx.effectsCatalog) ? ctx.effectsCatalog : [];
      const selected = catalog.filter((e) => e && ids.includes(e.id));
      return {
        vision: ctx.vision ?? "",
        video_spec: ctx.videoSpec ?? "",
        selectedEffectIds: ids,
        selectedEffects: selected,
      };
    }
    case "get_navigation_md":
      return { navigationMd: wc.navigationMd ?? "" };
    case "get_site_html_slice":
      return sliceText(wc.site?.html, args.offset, args.length);
    case "get_site_css_slice":
      return sliceText(wc.site?.css, args.offset, args.length);
    case "get_site_js_slice":
      return sliceText(wc.site?.js, args.offset, args.length);
    default:
      return { error: `Unknown tool ${name}` };
  }
}

/**
 * Proactive delay between API calls to stay under RPM/TPM limits.
 * Optional throttle: set GENERATING_AGENT_ROUND_DELAY_MS (default 0 = no delay).
 */
function resolveRoundDelayMs() {
  const raw = process.env.GENERATING_AGENT_ROUND_DELAY_MS;
  if (raw != null && String(raw).trim() !== "") {
    const n = Number.parseInt(String(raw), 10);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveOpenAiVoiceSoundModel() {
  const raw = (process.env.GENERATING_AGENT_VOICE_SOUND_MODEL || "").trim();
  return raw || DEFAULT_OPENAI_VOICE_SOUND_MODEL;
}

function parseJsonVoiceSound(content) {
  const parsed = parseLlmJsonObject(content);
  if (!parsed.ok) {
    const detail = (parsed.attempts || []).slice(0, 2).join(" | ") || "";
    throw new Error(
      detail ? `${parsed.error} (${detail})` : parsed.error
    );
  }
  const data = parsed.data;
  const v = data.voice_md;
  const s = data.sound_md;
  if (typeof v !== "string" || typeof s !== "string" || !v.trim() || !s.trim()) {
    throw new Error("Response must be JSON with non-empty voice_md and sound_md strings");
  }
  return { voice_md: v.trim(), sound_md: s.trim() };
}

function resolveSystemPrompt(base, ctx) {
  if (ctx.videoStyle === "fast-paced") return base + FAST_PACED_ADDENDUM;
  return base;
}

/**
 * OpenAI phase 1: tool loop with premium model → ideas_md + prompt_md.
 * @returns {Promise<{ ideas_md: string; prompt_md: string } | null>}
 */
async function runOpenAiVisualPhase(client, model, ctx) {
  const userBrief = {
    instruction:
      "Read the captured site using tools. Brainstorm ideas_md, then write prompt_md. Call submit_visual_brief once with exactly those two markdown strings.",
    note: "HTML/CSS/JS may be large—use slices. Total duration in prompt_md must match vision + video_spec from get_user_vision_and_effects.",
  };

  const systemPrompt = resolveSystemPrompt(SYSTEM_OPENAI_PHASE1, ctx);

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: JSON.stringify(userBrief) },
  ];

  let visualSubmit = null;
  let rounds = 0;
  const roundDelay = resolveRoundDelayMs();
  while (!visualSubmit && rounds < MAX_TOOL_ROUNDS) {
    rounds += 1;
    if (rounds > 1 && roundDelay > 0) {
      await sleep(roundDelay);
    }
    const completion = await withOpenAiRateLimitRetry(
      () =>
        client.chat.completions.create(
          chatCompletionBody(model, {
            model,
            messages,
            tools: toolsOpenAiVisual,
            tool_choice: "auto",
            temperature: 0.7,
          })
        ),
      { label: "generating-agent-visual", maxAttempts: 8 }
    );

    const choice = completion.choices[0];
    const msg = choice?.message;
    if (!msg) return null;

    messages.push(msg);

    const toolCalls = msg.tool_calls;
    if (!toolCalls?.length) {
      messages.push({
        role: "user",
        content:
          "You must call tools to read the bundle, then call submit_visual_brief with ideas_md and prompt_md only. Do not reply with plain text only.",
      });
      continue;
    }

    for (const tc of toolCalls) {
      const name = tc.function?.name;
      let args = {};
      try {
        args = JSON.parse(tc.function?.arguments || "{}");
      } catch {
        args = {};
      }

      if (name === "submit_visual_brief") {
        const i = args.ideas_md;
        const p = args.prompt_md;
        if (typeof i === "string" && typeof p === "string" && i.trim() && p.trim()) {
          visualSubmit = { ideas_md: i.trim(), prompt_md: p.trim() };
        }
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(
            visualSubmit
              ? { ok: true, message: "Visual brief accepted." }
              : {
                  ok: false,
                  message:
                    "ideas_md and prompt_md must be non-empty markdown strings. Fix and call submit_visual_brief again.",
                }
          ),
        });
        if (visualSubmit) break;
        continue;
      }

      const result = runTool(name, args, ctx);
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      });
    }
  }

  return visualSubmit;
}

/**
 * OpenAI phase 2: single JSON completion with cheaper model → voice_md + sound_md.
 */
async function runOpenAiVoiceSoundPhase(client, model, ctx, ideasMd, promptMd) {
  const userPayload = {
    vision: ctx.vision ?? "",
    video_spec: ctx.videoSpec ?? "",
    selected_effects: ctx.effectsCatalog?.filter((e) => e && ctx.selectedEffectIds?.includes(e.id)) ?? [],
    ideas_md: ideasMd,
    prompt_md: promptMd,
  };

  const completion = await withOpenAiRateLimitRetry(
    () =>
      client.chat.completions.create(
        chatCompletionBody(model, {
          model,
          temperature: 0.5,
          max_tokens: VOICE_SOUND_MAX_COMPLETION_TOKENS,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: resolveSystemPrompt(SYSTEM_VOICE_SOUND_JSON, ctx) },
            {
              role: "user",
              content: JSON.stringify({
                instruction:
                  "Produce voice_md and sound_md as specified. Output JSON with keys voice_md and sound_md only.",
                bundle: userPayload,
              }),
            },
          ],
        })
      ),
    { label: "generating-agent-voice-sound", maxAttempts: 8 }
  );

  const content = completion.choices[0]?.message?.content ?? "";
  return parseJsonVoiceSound(content);
}

export async function handler(event) {
  const cors = corsHeaders();

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { ok: false, error: "Invalid JSON body" });
  }

  const websiteComponent = body.websiteComponent;
  if (!websiteComponent || typeof websiteComponent !== "object") {
    return jsonResponse(400, {
      ok: false,
      error: "Body must include websiteComponent (saved bundle)",
    });
  }

  const videoStyle = typeof body.videoStyle === "string" ? body.videoStyle : "default";

  const ctx = {
    websiteComponent,
    vision: typeof body.vision === "string" ? body.vision : "",
    videoSpec: typeof body.videoSpec === "string" ? body.videoSpec : "",
    selectedEffectIds: Array.isArray(body.selectedEffectIds)
      ? body.selectedEffectIds.filter((x) => typeof x === "string")
      : [],
    effectsCatalog: Array.isArray(body.effectsCatalog) ? body.effectsCatalog : [],
    videoStyle,
  };

  const backend = resolveGeneratingBackend();
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (backend === "anthropic" && !anthropicKey) {
    return jsonResponse(501, {
      ok: false,
      error:
        "ANTHROPIC_API_KEY is not configured. Add it to .env (local) or Netlify environment variables. Do not commit API keys to git.",
      code: "missing_anthropic_key",
    });
  }
  if (backend === "openai" && !openaiKey) {
    return jsonResponse(501, {
      ok: false,
      error:
        "OPENAI_API_KEY is not configured, or set ANTHROPIC_API_KEY to use Claude for the generating agent.",
      code: "missing_openai_key",
    });
  }

  const userBrief = {
    instruction:
      "Read the captured site using tools. First brainstorm the video concept (ideas_md), then write voice_md, sound_md, and prompt_md based on that concept. Submit all four via submit_generating_outputs.",
    note: "HTML/CSS/JS may be large—use slices. Navigation markdown is the structural map. Total video length must follow get_user_vision_and_effects (vision + video_spec); backgrounds and gradients must be grounded in the site's own palette from the bundle. START with ideas_md — the creative concept drives everything else.",
  };

  let submitted = null;
  let modelUsed = "";
  /** OpenAI only: model used for voice_md + sound_md JSON pass. */
  let voiceSoundModelUsed = null;

  try {
    if (backend === "anthropic") {
      modelUsed = process.env.GENERATING_AGENT_ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
      const maxTokRaw = process.env.GENERATING_AGENT_ANTHROPIC_MAX_TOKENS;
      const maxOutputTokens =
        maxTokRaw != null && String(maxTokRaw).trim() !== ""
          ? Math.min(128_000, Math.max(1024, Number.parseInt(String(maxTokRaw), 10) || 64_000))
          : 64_000;
      const { submitted: sub } = await runAnthropicGeneratingLoop({
        apiKey: anthropicKey,
        model: modelUsed,
        system: resolveSystemPrompt(SYSTEM, ctx),
        userBrief,
        openAiTools: toolsGeneratingFull,
        runTool,
        ctx,
        maxRounds: MAX_TOOL_ROUNDS,
        maxOutputTokens,
      });
      submitted = sub;
    } else {
      const visualModel = process.env.GENERATING_AGENT_MODEL || DEFAULT_OPENAI_MODEL;
      const voiceSoundModel = resolveOpenAiVoiceSoundModel();
      voiceSoundModelUsed = voiceSoundModel;
      modelUsed = visualModel;
      const client = new OpenAI({ apiKey: openaiKey });

      const visual = await runOpenAiVisualPhase(client, visualModel, ctx);
      if (!visual) {
        return jsonResponse(504, {
          ok: false,
          error:
            "Visual phase did not finish with submit_visual_brief in time. Retry or simplify the page capture.",
          code: "incomplete_visual_run",
        });
      }

      const phaseGap = resolveRoundDelayMs();
      if (phaseGap > 0) await sleep(phaseGap);

      let audioPair;
      try {
        audioPair = await runOpenAiVoiceSoundPhase(
          client,
          voiceSoundModel,
          ctx,
          visual.ideas_md,
          visual.prompt_md
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return jsonResponse(200, {
          ok: false,
          error: `Voice/sound phase failed: ${msg}`,
          code: "openai_voice_sound_failed",
          hint:
            "Check GENERATING_AGENT_VOICE_SOUND_MODEL (e.g. gpt-4o-mini). Phase 1 (ideas + prompt) succeeded; you can paste prompt_md and retry or fix the voice model.",
        });
      }

      submitted = {
        ideas_md: visual.ideas_md,
        prompt_md: visual.prompt_md,
        voice_md: audioPair.voice_md,
        sound_md: audioPair.sound_md,
      };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = e?.status ?? e?.response?.status;
    let overloadInBody = false;
    try {
      overloadInBody = /overloaded_error/i.test(JSON.stringify(e?.error ?? e));
    } catch {
      /* ignore */
    }
    const anthropicTransient =
      backend === "anthropic" &&
      (status === 429 ||
        status === 529 ||
        overloadInBody ||
        /overloaded|overloaded_error/i.test(msg));
    if (anthropicTransient || (backend !== "anthropic" && status === 429)) {
      return jsonResponse(429, {
        ok: false,
        error: msg,
        code: backend === "anthropic" ? "anthropic_rate_limit" : "openai_rate_limit",
        hint:
          backend === "anthropic"
            ? overloadInBody || /overloaded/i.test(msg)
              ? "Anthropic’s API is temporarily overloaded. Wait 1–2 minutes and retry. You can also set GENERATING_AGENT_ANTHROPIC_MODEL=claude-sonnet-4-6."
              : "Anthropic rate limit after retries. Wait and try again, or set GENERATING_AGENT_ANTHROPIC_MODEL=claude-sonnet-4-6."
            : "OpenAI rate limit after automatic retries. Wait and retry, or check billing and usage at platform.openai.com. Optional throttle: GENERATING_AGENT_ROUND_DELAY_MS.",
      });
    }
    if (backend === "openai") {
      const modelMissing =
        status === 404 ||
        /does not exist|model_not_found|invalid_model/i.test(msg);
      if (modelMissing) {
        return jsonResponse(400, {
          ok: false,
          error: msg,
          code: "openai_model_not_found",
          hint:
            "That model id is wrong or your org cannot use it. Set GENERATING_AGENT_MODEL to a model you have access to (e.g. gpt-5.4, gpt-5, gpt-5-mini, gpt-4o). See platform.openai.com/docs/models.",
        });
      }
      return jsonResponse(200, { ok: false, error: msg, code: "openai_error" });
    }
    const notFound = status === 404 || /not_found|invalid_model|model:/i.test(msg);
    if (notFound) {
      return jsonResponse(400, {
        ok: false,
        error: msg,
        code: "anthropic_model_not_found",
        hint:
          "Set GENERATING_AGENT_ANTHROPIC_MODEL to a model your key can use (e.g. claude-opus-4-6, claude-sonnet-4-6). See docs.anthropic.com models.",
      });
    }
    return jsonResponse(200, { ok: false, error: msg, code: "anthropic_error" });
  }

  if (!submitted) {
    return jsonResponse(504, {
      ok: false,
      error:
        "Model did not finish with submit_generating_outputs in time. Retry or simplify the page capture.",
      code: "incomplete_run",
    });
  }

  const successBody = {
    ok: true,
    ideasMd: submitted.ideas_md,
    voiceMd: submitted.voice_md,
    soundMd: submitted.sound_md,
    promptMd: submitted.prompt_md,
    model: modelUsed,
    provider: backend,
  };
  if (backend === "openai" && voiceSoundModelUsed) {
    successBody.voiceSoundModel = voiceSoundModelUsed;
  }
  return jsonResponse(200, successBody);
}
