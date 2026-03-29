---
name: inspiration-examples
description: Curated collection of real-world startup video techniques, effect patterns, and production references. Use these as templates when building promo videos.
metadata:
  tags: inspiration, examples, effects, reference, startup, launch, promo
---

# Inspiration & Effect Examples for Promo Videos

Study these real-world patterns. Every video you produce should use at least 5-6 of these techniques combined.

## Reference videos (study these for quality bar)

### 1. Collato — Product Hunt Launch (Burnwe, 52s)
**Style:** Motion graphics explainer with illustrated characters + UI screenshots
**Key techniques:**
- Opens with relatable problem statement (animated character at desk)
- Product reveal at ~12s with smooth scale-in transition
- UI shown inside device frame with cursor click-throughs demonstrating features
- Each feature gets its own 5-7s scene with a single clear message
- Kinetic typography: key phrases animate in bold with color emphasis
- Consistent brand color palette throughout (purples, blues)
- Sound design: whoosh on transitions, click on UI interactions, subtle ambient synth
- Closes with clear CTA + URL + "start for free" tagline
**Takeaway:** One feature per scene, problem→solution arc, 52 seconds total

### 2. Remotion AnimStats Hero (remotionlambda CDN)
**Style:** Data visualization + metric counters in a sleek dark UI
**Key techniques:**
- Dark gradient background with subtle noise texture
- Number counters animate up with spring easing (0→value)
- Bar charts grow from bottom with staggered delays per bar
- Glassmorphism stat cards with backdrop-blur
- Smooth camera pan across the dashboard
- Floating particles in background for depth
- Minimal text — let the visuals tell the story
**Takeaway:** Data-heavy products should animate their metrics, not just show screenshots

### 3. Google Product Ads (e.g. "Introducing Google Vids", Pixel launches)
**Style:** Floating 3D UI mockups, cinematic camera, parallax depth
**Key techniques:**
- UI screenshots float in 3D space (perspective: 1200, rotateX/Y)
- Slow cinematic zoom-in to specific features
- Gradient mesh backgrounds that shift organically (sin/cos drift)
- Light leaks between scenes (warm amber wash)
- Word-by-word headline animation with spring overshoot
- Device frames with realistic chrome (dots, address bar, shadow)
- Multi-layer parallax (bg mesh → mid particles → fg content)
- Every scene has ambient motion (nothing is ever fully static)
**Takeaway:** This is the quality bar. Premium = depth + motion + polish everywhere

### 4. SuperMotion-style Product Demos
**Style:** Screen recording enhanced with motion graphics overlays
**Key techniques:**
- Raw screenshot/recording wrapped in browser or phone frame
- Auto-zoom on key UI actions (smooth ease-in-out scale)
- 3D tilt on device frame for depth (rotateX -5deg, rotateY 8deg)
- Animated text callouts pointing to features (arrow + label)
- Custom gradient backgrounds (solid → gradient → image/GIF)
- Scene transitions: smooth slide-right or crossfade
- Annotation layers: arrows, highlight rings, numbered markers
**Takeaway:** Even simple screen recordings become premium with device frames + zoom + callouts

### 5. Stripe / Linear / Vercel Marketing Videos
**Style:** Dark mode, monochrome with accent, code-forward
**Key techniques:**
- Dark (#0a0a0a) backgrounds with single accent color
- Code blocks that type out letter-by-letter (typewriter effect)
- Terminal/CLI output that scrolls with realistic timing
- Glassmorphism cards floating in grid layouts
- Subtle grid pattern or dot matrix in background
- Logo morphs or icon animations with spring physics
- Performance metrics animate with number tickers
- Minimal copy — visual-first storytelling
**Takeaway:** Developer tools should feel technical but polished


## Effect Pattern Library

### A. Text Effects

#### A1. Word-by-Word Stagger
```tsx
const words = (text ?? "Fallback headline").split(" ");
{words.map((word, i) => {
  const delay = i * 4;
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
  const y = interpolate(s, [0, 1], [40, 0]);
  const o = interpolate(s, [0, 1], [0, 1]);
  return (
    <span key={i} style={{
      display: "inline-block",
      transform: `translateY(${y}px)`,
      opacity: o,
      marginRight: 12,
    }}>{word}</span>
  );
})}
```

#### A2. Shimmer Gradient Text
```tsx
const shimmerX = interpolate(frame, [0, 60], [-200, 400]);
<span style={{
  background: `linear-gradient(90deg, #fff 0%, ${accentColor} 50%, #fff 100%)`,
  backgroundSize: "200% 100%",
  backgroundPosition: `${shimmerX}px 0`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}}>
```

#### A3. Typewriter with Blinking Cursor
```tsx
const charCount = Math.floor(interpolate(frame, [0, textLength * 2], [0, textLength], { extrapolateRight: "clamp" }));
const visibleText = fullText.slice(0, charCount);
const cursorVisible = Math.floor(frame / 15) % 2 === 0;
<span>{visibleText}</span>
<span style={{ opacity: cursorVisible ? 1 : 0 }}>|</span>
```

#### A4. Text Highlight Sweep
```tsx
const sweepProgress = interpolate(frame, [startFrame, startFrame + 20], [0, 100], { extrapolateRight: "clamp" });
<span style={{ position: "relative" }}>
  <span style={{
    position: "absolute", bottom: 0, left: 0, height: "35%",
    width: `${sweepProgress}%`,
    background: highlightColor,
    opacity: 0.3,
    borderRadius: 4,
  }} />
  {highlightedText}
</span>
```

### B. UI Showcase Effects

#### B1. Browser Frame Slide-In with 3D
```tsx
const enter = spring({ frame, fps, config: { damping: 20, stiffness: 60, mass: 1.2 } });
const y = interpolate(enter, [0, 1], [200, 0]);
const scale = interpolate(enter, [0, 1], [0.7, 0.85]);
<div style={{
  perspective: 1200,
  transform: `translateY(${y}px) scale(${scale}) rotateX(-8deg) rotateY(12deg)`,
  opacity: enter,
  transformStyle: "preserve-3d",
}}>
  <FloatingBrowser url="app.example.com">
    {/* UI content */}
  </FloatingBrowser>
</div>
```

#### B2. Feature Zoom with Glassmorphism Label
```tsx
const zoomProgress = interpolate(frame, [0, 25], [1, 2.2], {
  extrapolateRight: "clamp",
  easing: Easing.inOut(Easing.quad),
});
<div style={{
  transform: `scale(${zoomProgress})`,
  transformOrigin: "65% 40%",
}}>
  {/* Full UI */}
</div>
{/* Floating glassmorphism label */}
<div style={{
  position: "absolute", right: 80, top: "40%",
  padding: "16px 24px",
  background: "rgba(255,255,255,0.1)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 16,
  transform: `translateX(${interpolate(enter, [0, 1], [60, 0])}px)`,
  opacity: enter,
}}>
  <span style={{ fontSize: 14, fontWeight: 600 }}>Feature Name</span>
</div>
```

#### B3. Cursor with Click Ripple
```tsx
const clickRippleScale = spring({
  frame: frame - clickFrame,
  fps,
  config: { damping: 8, stiffness: 200 },
});
{isClicking && (
  <div style={{
    position: "absolute",
    left: cursorX - 20, top: cursorY - 20,
    width: 40, height: 40,
    borderRadius: "50%",
    border: "2px solid rgba(99,102,241,0.6)",
    background: "rgba(99,102,241,0.12)",
    transform: `scale(${clickRippleScale})`,
    opacity: interpolate(clickRippleScale, [0, 1], [1, 0]),
  }} />
)}
```

### C. Data & Metric Effects

#### C1. Number Counter with Spring
```tsx
const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 40 } });
const displayValue = Math.round(interpolate(progress, [0, 1], [0, targetValue]));
const formatted = displayValue.toLocaleString();
<span style={{ fontVariantNumeric: "tabular-nums" }}>{formatted}</span>
```

#### C2. Progress Bar Fill
```tsx
const fillWidth = interpolate(frame, [startFrame, startFrame + 40], [0, targetPercent], {
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
<div style={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)" }}>
  <div style={{
    width: `${fillWidth}%`, height: "100%", borderRadius: 4,
    background: `linear-gradient(90deg, ${startColor}, ${endColor})`,
    transition: "none",
  }} />
</div>
```

#### C3. Bar Chart Growth
```tsx
{bars.map((bar, i) => {
  const barSpring = spring({
    frame: frame - i * 5,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const height = interpolate(barSpring, [0, 1], [0, bar.value]);
  return (
    <div key={i} style={{
      width: barWidth,
      height,
      background: bar.color,
      borderRadius: "4px 4px 0 0",
      transformOrigin: "bottom",
    }} />
  );
})}
```

### D. Transition Effects

#### D1. Crossfade with Scale
Exit: scale 1→0.97, opacity 1→0 over 18 frames (ease-in)
Enter: scale 1.03→1, opacity 0→1 over 18 frames (ease-out)
Overlap both by 12-18 frames using `<Sequence>` offsets.

#### D2. Directional Wipe
```tsx
const wipeProgress = interpolate(frame, [0, 24], [0, 100], {
  easing: Easing.inOut(Easing.cubic),
  extrapolateRight: "clamp",
});
<div style={{ clipPath: `inset(0 ${100 - wipeProgress}% 0 0)` }}>
  {/* Incoming scene */}
</div>
```

#### D3. Circle Reveal
```tsx
const radius = interpolate(frame, [0, 30], [0, 150], {
  easing: Easing.out(Easing.cubic),
  extrapolateRight: "clamp",
});
<div style={{
  clipPath: `circle(${radius}% at 50% 50%)`,
}}>
  {/* New scene content */}
</div>
```

#### D4. Slide + Blur Focus
```tsx
const slideX = interpolate(frame, [0, 22], [100, 0], {
  easing: Easing.out(Easing.cubic),
  extrapolateRight: "clamp",
});
const blur = interpolate(frame, [0, 22], [8, 0], { extrapolateRight: "clamp" });
<div style={{
  transform: `translateX(${slideX}%)`,
  filter: `blur(${blur}px)`,
}}>
```

### E. Decorative & Ambient Effects

#### E1. Floating Particles
```tsx
function Particles({ count = 30, color = "rgba(255,255,255,0.3)" }) {
  const frame = useCurrentFrame();
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      x: (i * 37 + 13) % 100,
      y: (i * 53 + 7) % 100,
      size: 2 + (i % 4),
      speed: 0.3 + (i % 5) * 0.15,
      phase: i * 0.7,
    })),
  [count]);

  return particles.map((p, i) => (
    <div key={i} style={{
      position: "absolute",
      left: `${p.x}%`,
      top: `${p.y + Math.sin(frame * 0.02 + p.phase) * 3}%`,
      width: p.size, height: p.size,
      borderRadius: "50%",
      background: color,
      opacity: 0.3 + Math.sin(frame * 0.03 + p.phase) * 0.2,
      transform: `translateY(${Math.sin(frame * p.speed * 0.02) * 15}px)`,
    }} />
  ));
}
```

#### E2. Pulsing Glow Ring
```tsx
const pulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.4, 0.9]);
<div style={{
  position: "absolute",
  width: 300, height: 300,
  borderRadius: "50%",
  border: `2px solid rgba(99,102,241,${pulse * 0.4})`,
  boxShadow: `0 0 40px rgba(99,102,241,${pulse * 0.15}), inset 0 0 40px rgba(99,102,241,${pulse * 0.05})`,
}} />
```

#### E3. Rotating Dashed Ring
```tsx
const rotation = frame * 0.3;
<svg width="200" height="200" style={{
  position: "absolute",
  transform: `rotate(${rotation}deg)`,
  opacity: 0.15,
}}>
  <circle cx="100" cy="100" r="90"
    fill="none" stroke="currentColor" strokeWidth="1"
    strokeDasharray="8 12" />
</svg>
```

#### E4. Gradient Orbs
```tsx
function GradientOrb({ x, y, size, color, frame }: { x: number; y: number; size: number; color: string; frame: number }) {
  const drift = Math.sin(frame * 0.008) * 20;
  const pulse = interpolate(Math.sin(frame * 0.015), [-1, 1], [0.6, 1]);
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`, top: `${y}%`,
      width: size, height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
      filter: "blur(40px)",
      transform: `translate(${drift}px, ${Math.cos(frame * 0.01) * 15}px)`,
      opacity: pulse,
    }} />
  );
}
```

#### E5. Confetti Burst
```tsx
function ConfettiBurst({ triggerFrame, count = 40 }) {
  const frame = useCurrentFrame();
  const elapsed = frame - triggerFrame;
  if (elapsed < 0 || elapsed > 60) return null;

  const pieces = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + Math.random() * 0.5,
      speed: 4 + Math.random() * 8,
      rotSpeed: 5 + Math.random() * 15,
      color: ["#ff6b6b","#4ecdc4","#ffe66d","#a8e6cf","#ff8b94","#6c5ce7"][i % 6],
      size: 6 + Math.random() * 6,
    })),
  [count]);

  return pieces.map((p, i) => {
    const t = elapsed / 30;
    const x = Math.cos(p.angle) * p.speed * t * 60;
    const y = Math.sin(p.angle) * p.speed * t * 60 + t * t * 400;
    const rot = elapsed * p.rotSpeed;
    const opacity = interpolate(elapsed, [0, 40, 60], [1, 1, 0], { extrapolateRight: "clamp" });
    return (
      <div key={i} style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: p.size, height: p.size * 0.6,
        background: p.color,
        borderRadius: 2,
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
        opacity,
      }} />
    );
  });
}
```

### F. Notification & UI Element Effects

#### F1. Toast Notification Slide-In
```tsx
const slideIn = spring({ frame: frame - enterFrame, fps, config: { damping: 15, stiffness: 100 } });
const slideOut = frame > exitFrame
  ? interpolate(frame, [exitFrame, exitFrame + 12], [0, 1], { extrapolateRight: "clamp" })
  : 0;
const x = interpolate(slideIn, [0, 1], [320, 0]) + interpolate(slideOut, [0, 1], [0, 320]);

<div style={{
  position: "absolute", right: 20, top: yOffset,
  transform: `translateX(${x}px)`,
  padding: "12px 20px",
  background: "rgba(255,255,255,0.95)",
  borderRadius: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  display: "flex", alignItems: "center", gap: 10,
}}>
  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
  <span style={{ fontSize: 13, fontWeight: 500 }}>New notification message</span>
</div>
```

#### F2. Button with Glow Pulse
```tsx
const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);
<div style={{
  padding: "14px 32px",
  borderRadius: 14,
  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
  boxShadow: `0 12px 28px -8px ${primaryColor}${Math.round(glowPulse * 99).toString(16).padStart(2, "0")}`,
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
}}>
  Get Started Free
</div>
```


## Narrative Templates

### Template 1: "Problem → Product → Proof" (30-60s)
1. **Hook** (3-5s): Bold statement about the problem. Kinetic typography.
2. **Pain point** (5-8s): Show the old/bad way. Can use split-screen or messy UI.
3. **Product reveal** (5-8s): "Introducing [Product]" — device frame slides in with 3D tilt.
4. **Feature demo** (10-25s): 2-4 features, one per scene, cursor click-throughs.
5. **Results** (5-8s): Metric counters, testimonials, or before/after comparison.
6. **CTA** (3-5s): Logo, tagline, URL, button with glow.

### Template 2: "Feature Showcase" (45-90s)
1. **Brand intro** (3-5s): Logo + gradient mesh background.
2. **Overview** (5-8s): Full app in browser frame, camera pans across.
3. **Feature 1-5** (6-10s each): Zoom into feature, glassmorphism label, cursor demo.
4. **Integration/workflow** (5-8s): Show how features connect. Animated flow diagram.
5. **CTA** (3-5s): Call to action with spring-in button.

### Template 3: "Launch Announcement" (15-30s, Product Hunt style)
1. **Logo burst** (2-3s): Logo springs in with particle burst.
2. **One-liner** (3-4s): Product tagline, kinetic typography.
3. **Quick demo** (8-15s): 3-4 rapid feature glimpses in device frames, fast transitions.
4. **Social proof** (2-3s): "Trusted by X users" with counter animation.
5. **CTA** (2-3s): "Try it free" button with glow + URL.

### Template 4: "How It Works" (60-120s, explainer style)
1. **Problem statement** (5-10s): Animated illustration of the pain point.
2. **Step 1** (10-15s): First step shown in device frame with cursor interaction.
3. **Step 2** (10-15s): Second step, different layout (cards, split-screen).
4. **Step 3** (10-15s): Final step, results shown with metric counters.
5. **Summary** (5-10s): All steps shown as a flow diagram or card grid.
6. **CTA** (3-5s): Clear call to action.
