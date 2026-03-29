---
name: visual-design
description: Production-grade visual design for Remotion — Google-ad-quality motion graphics with 3D perspective, device frames, camera motion, parallax, light leaks, and choreographed animation.
metadata:
  tags: design, css, styling, layout, 3d, perspective, device-frame, camera, parallax, light-leaks, motion-graphics
---

# Production-grade visual design for Remotion

Target quality: **Google product ads** (floating 3D UI mockups, cinematic camera motion, parallax depth, light leaks, staggered choreography). Every video should feel like a professional motion graphics piece, not a slideshow.

## 1. Floating 3D UI mockups (perspective transforms)

The signature look of modern product ads: UI screenshots/recreations floating in 3D space with perspective.

```tsx
function FloatingUI({ children, rotateX = -8, rotateY = 12, scale = 0.85 }: {
  children: React.ReactNode;
  rotateX?: number; rotateY?: number; scale?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 60, mass: 1.2 } });
  const entryY = interpolate(enter, [0, 1], [120, 0], { extrapolateRight: "clamp" });
  const entryScale = interpolate(enter, [0, 1], [0.7, scale], { extrapolateRight: "clamp" });

  const gentleDrift = Math.sin(frame * 0.015) * 3;
  const gentleRotate = Math.sin(frame * 0.02) * 1.5;

  return (
    <div style={{
      perspective: 1200,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{
        transform: `
          translateY(${entryY + gentleDrift}px)
          scale(${entryScale})
          rotateX(${rotateX + gentleRotate}deg)
          rotateY(${rotateY - gentleRotate * 0.5}deg)
        `,
        opacity: enter,
        transformStyle: "preserve-3d",
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.35), 0 20px 40px -10px rgba(0,0,0,0.2)",
        borderRadius: 16,
        overflow: "hidden",
      }}>
        {children}
      </div>
    </div>
  );
}
```

## 2. Browser/device frames

Wrap UI recreations in realistic browser chrome to show them as real app screenshots.

```tsx
function BrowserFrame({ children, url = "app.example.com", width = 1200, shadow = true }: {
  children: React.ReactNode;
  url?: string;
  width?: number;
  shadow?: boolean;
}) {
  return (
    <div style={{
      width,
      borderRadius: 12,
      overflow: "hidden",
      background: "#1a1a1a",
      boxShadow: shadow ? "0 40px 80px -20px rgba(0,0,0,0.45)" : "none",
    }}>
      {/* Title bar */}
      <div style={{
        height: 36,
        background: "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 8,
      }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
        <div style={{
          flex: 1,
          marginLeft: 16,
          height: 22,
          borderRadius: 6,
          background: "rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
          fontFamily: "system-ui, sans-serif",
        }}>
          {url}
        </div>
      </div>
      {/* Content viewport */}
      <div style={{ background: "#fff", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
```

A pre-built `BrowserFrame` component is available at `packages/remotion/src/BrowserFrame.tsx`. Import it: `import { BrowserFrame } from "./BrowserFrame";`

## 3. Camera motion simulation

Simulate cinematic camera movements using animated scale + translate on a wrapper.

```tsx
function CameraMove({ children, startScale = 1, endScale = 1.15,
  startX = 0, endX = -80, startY = 0, endY = -40, durationInFrames = 120 }: {
  children: React.ReactNode;
  startScale?: number; endScale?: number;
  startX?: number; endX?: number;
  startY?: number; endY?: number;
  durationInFrames?: number;
}) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const scale = interpolate(progress, [0, 1], [startScale, endScale]);
  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);

  return (
    <div style={{
      transform: `scale(${scale}) translate(${x}px, ${y}px)`,
      transformOrigin: "center center",
      width: "100%", height: "100%",
    }}>
      {children}
    </div>
  );
}
```

Camera motion patterns:
- **Slow zoom in** on a full page: `startScale=0.95, endScale=1.1` over 150 frames
- **Pan to feature**: combine translateX/Y shift with slight zoom
- **Pull back reveal**: `startScale=1.4, endScale=1.0` to reveal full layout
- **Drift**: very subtle constant translate with `Math.sin` for natural floating feel

## 4. Animated cursor / pointer

Show interactions by animating a cursor across the screen.

**Do not duplicate geometry by hand:**

- Import **`arrowTipOffsetPx`** and **`CURSOR_ARROW_PATH_D`** from `packages/remotion/src/cursorTipOffset.ts` (single source for the arrow path and tip-in-viewBox math).
- Each `(x, y)` in `points` is the **pointer tip** in the same coordinate system as your mock UI. Render with `left: x - tip.dx`, `top: y - tip.dy` where `tip = arrowTipOffsetPx(24)` (or your SVG outer size in px).
- Put the cursor inside the **same `position: relative` wrapper** as the page mockup—typically the white **content** area of `<BrowserFrame>` (below the chrome). See **`BROWSER_FRAME_CHROME_HEIGHT`** in `BrowserFrame.tsx`.
- **Derive** targets from layout: e.g. share a `hitRect` / button box with a highlight ring and set `clickTarget.x = parentLeft + hitRect.l + hitRect.w / 2`—avoid cursor-only coordinates that don’t match any element.

```tsx
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from "./cursorTipOffset";

function AnimatedCursor({ points, startDelay = 0 }: {
  points: { x: number; y: number; frame: number; click?: boolean }[];
  startDelay?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startDelay;

  let x = points[0]?.x ?? 0;
  let y = points[0]?.y ?? 0;
  let clicking = false;

  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    if (f >= from.frame && f <= to.frame) {
      const t = interpolate(f, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      });
      x = interpolate(t, [0, 1], [from.x, to.x]);
      y = interpolate(t, [0, 1], [from.y, to.y]);
      break;
    } else if (f > to.frame) {
      x = to.x;
      y = to.y;
    }
  }

  const lastPoint = points.find(p => p.click && Math.abs(f - p.frame) < 4);
  if (lastPoint) clicking = true;

  const cursorScale = clicking
    ? interpolate(Math.abs(f - (lastPoint?.frame ?? 0)), [0, 4], [0.8, 1], { extrapolateRight: "clamp" })
    : 1;

  const visible = f >= 0;
  const tip = arrowTipOffsetPx(24);

  return visible ? (
    <div style={{
      position: "absolute",
      left: x - tip.dx, top: y - tip.dy,
      width: 24, height: 24,
      transform: `scale(${cursorScale})`,
      pointerEvents: "none",
      zIndex: 9999,
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d={CURSOR_ARROW_PATH_D} fill="white" stroke="black" strokeWidth="1.5" />
      </svg>
      {clicking && (
        <div style={{
          position: "absolute", top: -8, left: -8,
          width: 40, height: 40, borderRadius: "50%",
          border: "2px solid rgba(100,100,255,0.5)",
          background: "rgba(100,100,255,0.1)",
        }} />
      )}
    </div>
  ) : null;
}
```

## 5. Parallax depth layers

Create depth by moving layers at different speeds.

```tsx
function ParallaxScene({ children, bgContent, midContent }: {
  children: React.ReactNode;
  bgContent?: React.ReactNode;
  midContent?: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const bgShift = frame * 0.15;
  const midShift = frame * 0.4;

  return (
    <AbsoluteFill>
      {/* Background layer - slowest */}
      <AbsoluteFill style={{ transform: `translateY(${-bgShift}px) scale(1.05)` }}>
        {bgContent}
      </AbsoluteFill>
      {/* Mid layer - medium speed */}
      <AbsoluteFill style={{ transform: `translateY(${-midShift}px)` }}>
        {midContent}
      </AbsoluteFill>
      {/* Foreground - fastest (stationary or slight motion) */}
      <AbsoluteFill>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
```

## 6. Feature zoom callout

Zoom into a specific area of a UI to highlight a feature, like product ads do.

```tsx
function FeatureZoom({ children, zoomOriginX = 50, zoomOriginY = 30,
  zoomScale = 2.2, holdFrames = 40, transitionFrames = 20 }: {
  children: React.ReactNode;
  zoomOriginX?: number; zoomOriginY?: number;
  zoomScale?: number; holdFrames?: number; transitionFrames?: number;
}) {
  const frame = useCurrentFrame();

  const zoomIn = interpolate(frame, [0, transitionFrames], [1, zoomScale], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const zoomOut = interpolate(
    frame,
    [transitionFrames + holdFrames, transitionFrames + holdFrames + transitionFrames],
    [zoomScale, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }
  );
  const scale = frame < transitionFrames + holdFrames ? zoomIn : zoomOut;

  const tx = interpolate(scale, [1, zoomScale], [0, -(zoomOriginX - 50) * (zoomScale - 1) * 0.5]);
  const ty = interpolate(scale, [1, zoomScale], [0, -(zoomOriginY - 50) * (zoomScale - 1) * 0.5]);

  return (
    <div style={{
      transform: `scale(${scale}) translate(${tx}%, ${ty}%)`,
      transformOrigin: `${zoomOriginX}% ${zoomOriginY}%`,
      width: "100%", height: "100%",
    }}>
      {children}
    </div>
  );
}
```

## 7. Gradient mesh backgrounds

Rich, organic gradient backgrounds that shift over time (like Google/Apple ads).

```tsx
function GradientMeshBg({ colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981"] }: {
  colors?: string[];
}) {
  const frame = useCurrentFrame();
  const angle1 = frame * 0.5;
  const angle2 = 120 + frame * 0.3;
  const angle3 = 240 + frame * 0.7;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: -100,
        background: `
          radial-gradient(ellipse 80% 60% at ${50 + Math.sin(frame * 0.01) * 20}% ${40 + Math.cos(frame * 0.008) * 15}%, ${colors[0]}88 0%, transparent 70%),
          radial-gradient(ellipse 70% 80% at ${30 + Math.cos(frame * 0.012) * 25}% ${60 + Math.sin(frame * 0.009) * 20}%, ${colors[1]}66 0%, transparent 65%),
          radial-gradient(ellipse 90% 50% at ${70 + Math.sin(frame * 0.015) * 15}% ${30 + Math.cos(frame * 0.011) * 15}%, ${colors[2]}55 0%, transparent 60%),
          radial-gradient(ellipse 60% 70% at ${50 + Math.cos(frame * 0.013) * 20}% ${70 + Math.sin(frame * 0.01) * 15}%, ${colors[3]}44 0%, transparent 70%),
          linear-gradient(135deg, #0f0f12 0%, #1a1a2e 100%)
        `,
      }} />
    </AbsoluteFill>
  );
}
```

## 8. Light leaks and lens flares

Use `@remotion/light-leaks` for cinematic transitions. If not installed, create CSS approximations:

```tsx
function LensFlare({ x = 70, y = 30, size = 400, color = "#fff" }: {
  x?: number; y?: number; size?: number; color?: string;
}) {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.3, 0.7]);
  const drift = Math.sin(frame * 0.02) * 30;

  return (
    <div style={{
      position: "absolute",
      left: `${x}%`, top: `${y}%`,
      width: size, height: size,
      transform: `translate(-50%, -50%) translate(${drift}px, 0)`,
      background: `radial-gradient(circle, ${color}${Math.round(pulse * 40).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
      filter: "blur(20px)",
      mixBlendMode: "screen",
      pointerEvents: "none",
    }} />
  );
}
```

## 9. Highlight / callout ring

Draw attention to a specific UI element with an animated ring.

```tsx
function HighlightRing({ x, y, width, height, delay = 0 }: {
  x: number; y: number; width: number; height: number; delay?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 80 } });
  const scale = interpolate(s, [0, 1], [0.5, 1], { extrapolateRight: "clamp" });
  const opacity = interpolate(s, [0, 0.3, 1], [0, 1, 0.7], { extrapolateRight: "clamp" });
  const pulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.6, 1]);

  return (
    <div style={{
      position: "absolute",
      left: x - 8, top: y - 8,
      width: width + 16, height: height + 16,
      borderRadius: 12,
      border: `2px solid rgba(99, 102, 241, ${opacity * pulse})`,
      boxShadow: `0 0 20px rgba(99, 102, 241, ${opacity * 0.3 * pulse})`,
      transform: `scale(${scale})`,
      pointerEvents: "none",
    }} />
  );
}
```

## 10. Scene composition patterns (Google-ad style)

### Pattern A: Hero intro (3-4s)
- Gradient mesh background slowly shifting
- Product name animates in word-by-word (staggered springs)
- Tagline fades up 0.5s later
- Floating particles + lens flare in background
- Light leak transition to next scene

### Pattern B: UI showcase in device frame (4-5s)
- Browser frame slides in from bottom with 3D perspective tilt
- Camera slowly zooms into the UI
- Cursor appears and navigates to a key feature
- Highlight ring appears around the feature
- Subtle parallax between browser frame and background

### Pattern C: Feature callout (3-4s)
- Smooth zoom into a specific area of the UI (FeatureZoom)
- Feature label/description animates in beside the zoomed area
- Glassmorphism panel contains the description text
- Gentle camera drift continues during hold

### Pattern D: Split-screen comparison (3-4s)
- Screen splits with animated wipe/clip-path
- Two states shown side by side
- Labels animate in for each side
- Transition: one side expands to fill screen

### Pattern E: Card/feature grid (3-4s)
- 2-3 cards animate in staggered (translateY + scale + slight rotate)
- Each card has hover-lift effect (slight translateY drift)
- Icons or illustrations inside cards have their own spring delays
- Grid gently floats as a whole (parallax with background)

### Pattern F: Closing/CTA (3-4s)
- Gradient mesh background intensifies
- Product name scales up with shimmer text effect
- CTA button slides in with spring + glow pulse
- Floating particles increase density
- Logo pops in with rotation + scale spring

## 11. Professional transition techniques

Between scenes, ALWAYS use one of:
1. **Crossfade** (15 frames): overlap `<Sequence>` blocks, exit animation + enter animation
2. **Light leak overlay**: `@remotion/light-leaks` `<LightLeak>` with `<TransitionSeries.Overlay>`
3. **Directional wipe**: `clip-path: inset()` animated horizontally or vertically
4. **Slide**: `@remotion/transitions` `slide({ direction: "from-right" })`
5. **Scale + fade**: outgoing scene scales to 0.95 + fades, incoming scales from 1.05 + fades in
6. **Circle reveal**: `clip-path: circle(R% at 50% 50%)` expanding from center or from a click point
7. **Slide + blur focus**: content slides in from a direction with a blur(8px→0) focus effect for a cinematic rack-focus feel

NEVER use hard cuts.

## 12. Metric counters and data visualization

Animate key stats and numbers for social proof or performance scenes.

```tsx
function MetricCounter({ value, suffix = "", prefix = "", delay = 0 }: {
  value: number; suffix?: string; prefix?: string; delay?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 40 } });
  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));
  const formatted = displayValue.toLocaleString();

  return (
    <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
```

Use for: user counts, revenue, performance %, uptime stats. Stagger multiple counters with increasing delay (0, 8, 16 frames).

## 13. Notification toast pop-ins

Show product activity with animated notification toasts — great for demonstrating real-time features.

```tsx
function NotificationToast({ message = "New notification", enterFrame, exitFrame, yOffset = 20 }: {
  message?: string; enterFrame: number; exitFrame: number; yOffset?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slideIn = spring({ frame: frame - enterFrame, fps, config: { damping: 15, stiffness: 100 } });
  const slideOut = frame > exitFrame
    ? interpolate(frame, [exitFrame, exitFrame + 12], [0, 1], { extrapolateRight: "clamp" })
    : 0;
  const x = interpolate(slideIn, [0, 1], [320, 0]) + interpolate(slideOut, [0, 1], [0, 320]);

  return (
    <div style={{
      position: "absolute", right: 20, top: yOffset,
      transform: `translateX(${x}px)`,
      padding: "12px 20px",
      background: "rgba(255,255,255,0.95)",
      borderRadius: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      display: "flex", alignItems: "center", gap: 10,
      fontSize: 13, fontWeight: 500,
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
      {message}
    </div>
  );
}
```

## 14. Confetti celebration burst

Use for milestone moments (sign-up, achievement, launch).

```tsx
function ConfettiBurst({ triggerFrame, count = 40 }: { triggerFrame: number; count?: number }) {
  const frame = useCurrentFrame();
  const elapsed = frame - triggerFrame;
  if (elapsed < 0 || elapsed > 60) return null;

  const pieces = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + (i * 0.3),
      speed: 4 + (i % 8),
      rotSpeed: 5 + (i % 15),
      color: ["#ff6b6b","#4ecdc4","#ffe66d","#a8e6cf","#ff8b94","#6c5ce7"][i % 6],
      size: 6 + (i % 6),
    })),
  [count]);

  return (
    <>
      {pieces.map((p, i) => {
        const t = elapsed / 30;
        const x = Math.cos(p.angle) * p.speed * t * 60;
        const y = Math.sin(p.angle) * p.speed * t * 60 + t * t * 400;
        const rot = elapsed * p.rotSpeed;
        const opacity = interpolate(elapsed, [0, 40, 60], [1, 1, 0], { extrapolateRight: "clamp" });
        return (
          <div key={i} style={{
            position: "absolute", left: "50%", top: "50%",
            width: p.size, height: p.size * 0.6,
            background: p.color, borderRadius: 2,
            transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
            opacity,
          }} />
        );
      })}
    </>
  );
}
```

## 15. Morphing shape transitions

Geometric shapes morph between states using animated clip-path. Great for concept transitions.

```tsx
function MorphingShape({ frame, startRadius = 0, endRadius = 150, centerX = 50, centerY = 50 }: {
  frame: number; startRadius?: number; endRadius?: number; centerX?: number; centerY?: number;
}) {
  const radius = interpolate(frame, [0, 30], [startRadius, endRadius], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });
  return { clipPath: `circle(${radius}% at ${centerX}% ${centerY}%)` };
}
```

Can also use `polygon()` or `inset()` for rectangular reveals, diagonal wipes, or diamond-shaped openings.

## 16. Icon animation burst

Icons spring in with overshoot + optional radial burst ring.

```tsx
function AnimatedIcon({ children, delay = 0, size = 64 }: {
  children: React.ReactNode; delay?: number; size?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 150, mass: 0.8 } });
  const scale = interpolate(s, [0, 1], [0, 1]);
  const rotate = interpolate(s, [0, 1], [-15, 0]);

  const ringScale = spring({ frame: frame - delay - 2, fps, config: { damping: 8, stiffness: 200 } });
  const ringOpacity = interpolate(ringScale, [0, 0.5, 1], [0, 0.6, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{
        position: "absolute", inset: -12,
        borderRadius: "50%",
        border: "2px solid currentColor",
        transform: `scale(${ringScale})`,
        opacity: ringOpacity,
      }} />
      <div style={{
        transform: `scale(${scale}) rotate(${rotate}deg)`,
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {children}
      </div>
    </div>
  );
}
```

## 17. Progress bar with threshold colors

Animated fill bar that changes color at milestones.

```tsx
function ProgressBar({ targetPercent = 85, startFrame = 0, barColor = "#6366f1", doneColor = "#22c55e" }: {
  targetPercent?: number; startFrame?: number; barColor?: string; doneColor?: string;
}) {
  const frame = useCurrentFrame();
  const fillWidth = interpolate(frame - startFrame, [0, 40], [0, targetPercent], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const color = fillWidth >= 100 ? doneColor : barColor;

  return (
    <div style={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)" }}>
      <div style={{
        width: `${fillWidth}%`, height: "100%", borderRadius: 4,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
      }} />
    </div>
  );
}
```

## 18. Rotating dashed orbit rings

Decorative rings that rotate around central elements (logo, device frame).

```tsx
function OrbitRing({ size = 300, dashArray = "8 12", speed = 0.3, color = "rgba(255,255,255,0.12)" }: {
  size?: number; dashArray?: string; speed?: number; color?: string;
}) {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} style={{
      position: "absolute",
      left: "50%", top: "50%",
      transform: `translate(-50%, -50%) rotate(${frame * speed}deg)`,
    }}>
      <circle cx={size/2} cy={size/2} r={size/2 - 4}
        fill="none" stroke={color} strokeWidth="1"
        strokeDasharray={dashArray} />
    </svg>
  );
}
```

Layer 2-3 rings with different sizes, speeds, and dash patterns for depth.

## 19. Scene composition patterns (continued)

### Pattern G: Metric dashboard (3-5s)
- Dark/gradient background
- 3-4 stat cards with glassmorphism styling
- Each card has a MetricCounter that counts up with staggered delays
- Optional bar chart or progress bars beneath
- Cards stagger in from bottom with spring + slight rotation
- Ambient: floating particles, orbit rings around the grid

### Pattern H: Workflow / how-it-works (4-6s)
- Step numbers or icons animate in left-to-right with connecting arrows
- Each step has a brief label that types out (typewriter effect)
- Connecting lines draw with animated stroke-dashoffset
- Can show a mini device frame at each step
- Background: subtle gradient with grid pattern overlay

### Pattern I: Testimonial / social proof (3-4s)
- Quote text fades in word-by-word
- Attribution (name, title, avatar placeholder) slides up after quote
- Star rating fills in one star at a time
- Background: soft gradient, large quotation mark watermark at 5% opacity
- Glassmorphism card wrapping the testimonial

### Pattern J: Before / After comparison (4-5s)
- Split screen with animated sliding divider
- "Before" side has desaturated or dimmed treatment
- "After" side is vibrant with the product applied
- Labels ("Before" / "After") spring in from top
- Divider line has a glowing dot handle that pulses

## 20. Anti-patterns (NEVER do these)

1. Text on a flat solid-color background with no decoration
2. All elements appearing simultaneously
3. Hard cuts between scenes
4. No device frame around UI screenshots
5. Static scenes with no ambient motion
6. Using the same layout for every scene
7. No exit animations before transitions
8. No depth layers (everything on one flat plane)
9. Generic system fonts with no type hierarchy
10. Ignoring the site's real CSS when recreating pages
11. Using Math.random() — Remotion renders are deterministic, use frame-based math or seeded values
12. Extremely fast animations that viewers can't follow (< 4 frames for major elements)
13. Overloading a single scene with too many competing animations — one focal point per beat
