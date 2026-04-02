import React, { useMemo } from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring, AbsoluteFill } from "remotion";

export const FONT_FAMILY = "Outfit, system-ui, sans-serif";

// Brand colors derived from the Flyer app aesthetic
export const COLORS = {
  background: "#f8f9fa",
  card: "#ffffff",
  primary: "#4f46e5",
  primaryLight: "#837df5",
  accent: "#0f172a",
  text: "#1e293b",
  textMuted: "#64748b",
  success: "#10b981",
  border: "#e2e8f0",
  calendarBlue: "#4068ff",
  surface: "#f1f5f9",
};

// Gradient mesh background component
export const GradientMesh: React.FC<{
  intensity?: number;
  tint?: "neutral" | "success" | "camera" | "cta";
}> = ({ intensity = 1, tint = "neutral" }) => {
  const frame = useCurrentFrame();

  const a1 = 50 + Math.sin(frame * 0.012) * 20;
  const a2 = 70 + Math.cos(frame * 0.009) * 15;
  const a3 = 30 + Math.sin(frame * 0.015 + 1) * 18;
  const a4 = 60 + Math.cos(frame * 0.011 + 2) * 12;

  const b1 = 40 + Math.cos(frame * 0.013) * 22;
  const b2 = 60 + Math.sin(frame * 0.008) * 18;

  let c1 = "#4f46e520";
  let c2 = "#818cfd20";
  let c3 = "#e0e7ff30";
  let base = "#f1f5f9";
  let linear = "165deg, #f8f9fa 0%, #e0e7ff 100%";

  if (tint === "success") {
    c1 = "#10b98130";
    c2 = "#6ee7b720";
    c3 = "#d1fae530";
    base = "#f0fdf4";
    linear = "165deg, #f0fdf4 0%, #d1fae5 100%";
  } else if (tint === "camera") {
    c1 = "#4068ff20";
    c2 = "#837df520";
    c3 = "#dbeafe30";
    base = "#eef2ff";
    linear = "165deg, #eef2ff 0%, #dbeafe 100%";
  } else if (tint === "cta") {
    c1 = "#4f46e535";
    c2 = "#837df525";
    c3 = "#605cff20";
    base = "#eef2ff";
    linear = "165deg, #eef2ff 0%, #c7d2fe 100%";
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -40,
          background: `
            radial-gradient(ellipse 70% 60% at ${a1}% ${b1}%, ${c1} 0%, transparent 70%),
            radial-gradient(ellipse 60% 70% at ${a2}% ${b2}%, ${c2} 0%, transparent 70%),
            radial-gradient(ellipse 80% 50% at ${a3}% ${b1}%, ${c3} 0%, transparent 70%),
            linear-gradient(${linear})
          `,
          opacity: intensity,
        }}
      />
    </AbsoluteFill>
  );
};

// Particle field component
export const ParticleField: React.FC<{ count?: number; color?: string }> = ( {
  count = 12,
  color = "rgba(79, 70, 229, 0.1)",
}) => {
  const frame = useCurrentFrame();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 137.5 + 35) % 100,
        y: (i * 97.3 + 15) % 100,
        size: 3 + (i % 4),
        speed: 0.004 + (i % 5) * 0.0015,
        phase: i * 0.63,
      })),
    [count]
  );

  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y + Math.sin(frame * p.speed + p.phase) * 6}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: color,
            opacity: 0.5 + Math.sin(frame * 0.025 + p.phase) * 0.3,
            transform: `translateY(${Math.sin(frame * p.speed * 1.2 + p.phase) * 4}px)`,
          }}
        />
      ))}
    </>
  );
};

// BlurText word animation
export const BlurTextWords: React.FC<{
  text: string;
  startFrame: number;
  wordDelay?: number;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  textAlign?: "React.CSSProperties['textAlign']";
  style?: React.CSSProperties;
}> = ({
  text = "",
  startFrame,
  wordDelay = 6,
  fontSize = 64,
  fontWeight = 700,
  color = COLORS.text,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = (text ?? "").split(" ").filter((x) => x.length > 0);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT_FAMILY,
        fontSize,
        fontWeight,
        color,
        ...style,
      }}
    >
      {words.map((word, i) => {
        const delay = startFrame + i * wordDelay;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 20, stiffness: 80 },
        });
        const blur = interpolate(progress, [0, 1], [10, 0], {
          extrapolateRight: "clamp",
        });
        const ty = interpolate(progress, [0, 1], [28, 0], {
          extrapolateRight: "clamp",
        });
        const opacity = interpolate(progress, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${ty}px)`,
              opacity,
              filter: `blur(${blur}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Orbit ring decoration
export const OrbitRing: React.FC<{
  size?: number;
  x?: string;
  y?: string;
  speed?: number;
  color?: string;
  dashArray?: string;
}> = ({
  size = 300,
  x = "50%",
  y = "50%",
  speed = 0.2,
  color = "rgba(79, 70, 229, 0.12)",
  dashArray = "8 4",
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${frame * speed}deg)`,
        pointerEvents: "none",
      }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 4}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray={dashArray}
      />
    </svg>
  );
};

// Floating orb component
export const GlowOrb: React.FC<{
  x: string;
  y: string;
  size: number;
  color: string;
  blur?: number;
  speed?: number;
  phase?: number;
}> = ({ x, y, size, color, blur = 60, speed = 0.008, phase = 0 }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * speed + phase) * 12;
  const pulse = 0.7 + Math.sin(frame * 0.02 + phase) * 0.15;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: `blur(${blur}px)`,
        transform: `translate(-50%, -50%) translateY(${drift}px)`,
        opacity: pulse,
        pointerEvents: "none",
      }}
    />
  );
};

// Simple cursor component
export const Cursor: React.FC<{
  x: number;
  y: number;
  clicking?: boolean;
  visible?: boolean;
}> = ({ x, y, clicking = false, visible = true }) => {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 2,
        top: y,
        width: 24,
        height: 24,
        transform: `scale(${clicking ? 0.86 : 1})`,
        pointerEvents: "none",
        zIndex: 1000,
        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 2l16 10-6.2 1.8-3.8 7.8L4 2z"
          fill="white"
          stroke="#333"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
};

// Card shell
export const Card: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 24,
        boxShadow: "0 16px 48px -12px rgba(0,0,0,0.12), 0 2px 16px -4px rgba(0,0,0,0.06)",
        padding: 32,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Scene fade out helper
export function useSceneFadeOut(sceneDuration: number, fadeStart: number) {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [fadeStart, sceneDuration],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }
  );
  return opacity;
}

