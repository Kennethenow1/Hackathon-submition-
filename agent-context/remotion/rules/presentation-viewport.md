---
name: presentation-viewport
description: 1920×1080 presentation grid — named slots so UI, video, and chrome do not collide.
metadata:
  tags: layout, viewport, safe-area, zones, composition
---

# Presentation viewport template (1920 × 1080)

Use this as a **contract** between scenes: every major layer gets a **named slot**. Put the slot name in **prompt.md** per scene and in **code comments** above each `AbsoluteFill` child so the Remotion agent and humans stay aligned.

## Safe areas

- **Outer margin**: keep critical text and tap targets at least **64px** from each edge (title-safe).
- **Bottom safe**: reserve **120px** from the bottom for captions, progress, or legal — unless the brief says full-bleed.
- **Top safe**: reserve **72px** below any persistent chrome if you simulate a window title bar.

## Named zones (percent of width × height, origin top-left)

Think in **layers** (back → front):

| Slot ID | Region (% of frame) | Typical use |
|--------|----------------------|-------------|
| `bg` | Full frame `0,0 — 100%×100%` | Gradient mesh, video backdrop, full-bleed motion |
| `bg-accent` | Optional stripes: e.g. left `0–38%` or right `62–100%` | Side wash, split-plate color |
| `hero-text` | Left `6%–52%`, vertical `18%–55%` | Headline, subcopy, bullets (LTR layouts) |
| `hero-media` | Right `48%–94%`, vertical `12%–88%` | Device frame, product shot, embedded video |
| `hero-media-alt` | Left `6%–48%` | Mirror layout when copy is on the right |
| `center-stage` | `20%–80%` × `15%–85%` | Single focal UI (modals, hero device centered) |
| `lower-thirds` | `6%–94%` × `72%–92%` | Stats, URL, CTA strip, captions |
| `pip` | `72%–96%` × `68%–94%` | Picture-in clip (small video over UI) |
| `decorative` | Full frame, **pointer-events: none** | Particles, orbs, light leaks, grid overlays |

## Rules to avoid conflicts

1. **One primary slot per scene** — either `hero-text` + `hero-media` **or** `center-stage`, not three competing focal regions.
2. **Do not place** a `FloatingBrowser` in `pip` and full copy in `hero-text` if both need the same right column — pick **split** or **pip**, not both overlapping.
3. **Video full-bleed** (`bg`): keep typography in `lower-thirds` or `hero-text` with a **legibility scrim** (semi-transparent gradient) documented in the brief.
4. **Z-index convention** (suggested): `bg` = 0, `decorative` = 1–2, content slots = 3–5, cursor/highlights = 6–8, transient toasts = 9+.

## Scene handoff in prompt.md

For each scene, add one line, for example:

`Viewport: hero-text (headline + CTA), hero-media (FloatingBrowser), decorative (particles only).`

The coding agent should mirror this in a short comment at the top of the scene component.
