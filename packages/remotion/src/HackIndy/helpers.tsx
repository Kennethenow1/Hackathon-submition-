import React, { useMemo } from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  AbsoluteFill,
} from "remotion";
import { COLORS } from "./constants";

// Gradient mesh background that uses site palette
export const GradientMeshBg: React.FC<{
  goldIntensity?: number;
  greenIntensity?: number;
  extraColors?: string[];
}> = ({ goldIntensity = 0.4, greenIntensity = 0.15, extraColors }) => {
  const frame = useCurrentFrame();
  const c1 = COLORS.racingGold;
  const c2 = COLORS.greenLive;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: -100,
          background: `
            radial-gradient(ellipse 80% 60% at ${50 + Math.sin(frame * 0.008) * 20}% ${40 + Math.cos(frame * 0.006) * 15}%, ${c1}${Math.round(goldIntensity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at ${30 + Math.cos(frame * 0.01) * 25}% ${60 + Math.sin(frame * 0.007) * 20}%, ${c2}${Math.round(greenIntensity * 255).toString(16).padStart(2, "0")} 0%, transparent 65%),
            radial-gradient(ellipse 70% 80% at ${70 + Math.sin(frame * 0.012) * 15}% ${30 + Math.cos(frame * 0.009) * 15}%, ${c1}18 0%, transparent 60%),
            linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 100%)
          `,
        }}
      />
    </AbsoluteFill>
  );
};

// Floating particles
export const Particles: React.FC<{
  count?: number;
  color?: string;
}> = ({ count = 20, color = "rgba(212,168,83,0.3)" }) => {
  const frame = useCurrentFrame();
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (i * 37 + 13) % 100,
        y: (i * 53 + 7) % 100,
        size: 1.5 + (i % 4),
        speed: 0.2 + (i % 5) * 0.1,
        phase: i * 0.7,
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
            top: `${p.y + Math.sin(frame * 0.02 + p.phase) * 2}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: color,
            opacity: 0.3 + Math.sin(frame * 0.03 + p.phase) * 0.2,
            transform: `translateY(${Math.sin(frame * p.speed * 0.02) * 12}px)`,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
};

// Glass panel
export const GlassPanel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style = {} }) => (
  <div
    style={{
      backdropFilter: "blur(16px)",
      background: "rgba(10,10,13,0.7)",
      border: `1px solid ${COLORS.borderGold}`,
      borderRadius: 16,
      padding: "16px 24px",
      ...style,
    }}
  >
    {children}
  </div>
);

// Racing badge component
export const RacingBadge: React.FC<{
  text?: string;
  style?: React.CSSProperties;
}> = ({ text = "Badge", style = {} }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 16px",
      border: `1px solid ${COLORS.borderGold}`,
      borderRadius: 6,
      background: COLORS.goldBgFaint,
      color: COLORS.racingGold,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      fontFamily: "monospace",
      ...style,
    }}
  >
    {text}
  </div>
);

// Metric counter
export const MetricCounter: React.FC<{
  value?: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  fontSize?: number;
}> = ({
  value = 100,
  suffix = "",
  prefix = "",
  delay = 0,
  fontSize = 48,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 40 },
  });
  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]));
  return (
    <span
      style={{
        fontVariantNumeric: "tabular-nums",
        fontWeight: 700,
        fontSize,
        color: COLORS.racingGold,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

// Orbit ring decoration
export const OrbitRing: React.FC<{
  size?: number;
  speed?: number;
  color?: string;
  dashArray?: string;
}> = ({
  size = 300,
  speed = 0.3,
  color = "rgba(212,168,83,0.12)",
  dashArray = "8 12",
}) => {
  const frame = useCurrentFrame();
  return (
    <svg
      width={size}
      height={size}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
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
        strokeWidth="1"
        strokeDasharray={dashArray}
      />
    </svg>
  );
};

// Word by word staggered text
export const WordStagger: React.FC<{
  text?: string;
  startFrame?: number;
  stagger?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number | string;
  letterSpacing?: string;
  style?: React.CSSProperties;
}> = ({
  text = "Hello World",
  startFrame = 0,
  stagger = 5,
  fontSize = 80,
  color = COLORS.textPrimary,
  fontWeight = 800,
  letterSpacing = "0.02em",
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = (text ?? "").split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0 20px",
        justifyContent: "center",
        ...style,
      }}
    >
      {words.map((word, i) => {
        const delay = startFrame + i * stagger;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });
        const y = interpolate(s, [0, 1], [40, 0]);
        const o = interpolate(s, [0, 1], [0, 1]);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${y}px)`,
              opacity: o,
              fontSize,
              fontWeight,
              color,
              letterSpacing,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

// Scanline overlay
export const ScanlineOverlay: React.FC<{ opacity?: number }> = ({
  opacity: op = 0.06,
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.01) * 2;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        opacity: op,
        transform: `translateY(${drift}px)`,
        pointerEvents: "none",
      }}
    />
  );
};

// Lens flare orb
export const LensFlare: React.FC<{
  x?: number;
  y?: number;
  size?: number;
  color?: string;
}> = ({ x = 70, y = 30, size = 350, color = COLORS.racingGold }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.2, 0.5]);
  const drift = Math.sin(frame * 0.02) * 20;
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) translate(${drift}px, 0)`,
        background: `radial-gradient(circle, ${color}${Math.round(pulse * 40)
          .toString(16)
          .padStart(2, "0")} 0%, transparent 60%)`,
        filter: "blur(25px)",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
    />
  );
};
