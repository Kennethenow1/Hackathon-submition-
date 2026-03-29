import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { COLORS } from "./constants";
import {
  GradientMeshBg,
  Particles,
  ScanlineOverlay,
} from "./helpers";

const { fontFamily } = loadInter();

const faqs = [
  {
    ch: "CH01",
    q: "What is a Hackathon?",
    a: "A hackathon is an event where students come together to learn, build, and showcase projects.",
    highlight: "learn, build, and showcase",
    zoomRange: [36, 84] as [number, number],
  },
  {
    ch: "CH02",
    q: "Who can attend?",
    a: "We welcome students from any school or major. No experience required!",
    highlight: "any school or major",
    zoomRange: [96, 152] as [number, number],
  },
  {
    ch: "CH03",
    q: "Do I have to apply?",
    a: "You do not need to apply. Just sign up on Devpost and show up!",
    highlight: "do not need to apply",
    zoomRange: [164, 220] as [number, number],
  },
];

const FAQCard: React.FC<{
  faq: (typeof faqs)[0];
  index?: number;
}> = ({ faq, index = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [hlStart, hlEnd] = faq.zoomRange;

  // Zoom into this card
  const zoomProgress = interpolate(frame, [hlStart, hlStart + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const zoomOut = interpolate(frame, [hlEnd - 12, hlEnd], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isActive = frame >= hlStart && frame <= hlEnd;
  const answerOpacity = isActive ? Math.min(zoomProgress, zoomOut) : 0;

  // Signal bars pulse
  const pulse = 0.4 + Math.sin(frame * 0.08 + index) * 0.3;

  // Highlight sweep
  const sweep = isActive
    ? interpolate(frame, [hlStart + 10, hlStart + 40], [0, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: 12,
        background: isActive
          ? "rgba(212,168,83,0.08)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${
          isActive ? COLORS.borderGold : "rgba(255,255,255,0.06)"
        }`,
        marginBottom: 10,
        transform: `scale(${isActive ? 1 + zoomProgress * 0.04 : 1})`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            background: COLORS.goldBg10,
            border: `1px solid ${COLORS.borderGold}`,
            color: COLORS.racingGold,
            fontSize: 10,
            fontFamily: "monospace",
            fontWeight: 700,
          }}
        >
          {faq.ch}
        </div>
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          {faq.q}
        </span>
        <div style={{ flex: 1 }} />
        {/* Signal bars */}
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
          {[1, 2, 3, 4].map((b) => (
            <div
              key={b}
              style={{
                width: 3,
                height: 4 + b * 3,
                borderRadius: 1,
                background: COLORS.racingGold,
                opacity: pulse,
              }}
            />
          ))}
        </div>
      </div>

      {/* Answer */}
      {answerOpacity > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 12px",
            opacity: answerOpacity,
            fontSize: 13,
            lineHeight: 1.6,
            color: COLORS.textSecondary,
            position: "relative",
          }}
        >
          {/* Highlight */}
          <div
            style={{
              position: "absolute",
              bottom: 2,
              left: 12,
              height: "32%",
              width: `${sweep * 0.6}%`,
              background: `${COLORS.racingGold}30`,
              borderRadius: 4,
            }}
          />
          {faq.a}
        </div>
      )}
    </div>
  );
};

export const Scene6FAQ: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entry
  const entry = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  // Camera zoom for feature focus
  const camScale = interpolate(
    frame,
    [0, 36, 84, 96, 152, 164, 220, 264],
    [0.95, 0.95, 1.08, 1.08, 1.08, 1.08, 1.08, 0.95],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const exitO = interpolate(
    frame,
    [durationInFrames - 36, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgPrimary,
        fontFamily,
        opacity: exitO,
      }}
    >
      <GradientMeshBg goldIntensity={0.3} greenIntensity={0.08} />
      <ScanlineOverlay opacity={0.04} />
      <Particles count={10} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 100px",
          transform: `scale(${camScale})`,
          opacity: entry,
        }}
      >
        {/* Header */}
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: COLORS.racingGold,
            fontFamily: "monospace",
            marginBottom: 6,
          }}
        >
          PIT STOP INTEL
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: COLORS.textPrimary,
            marginBottom: 30,
          }}
        >
          FAQ
        </div>

        {/* FAQ cards */}
        <div style={{ width: 700, maxHeight: 600 }}>
          {faqs.map((f, i) => (
            <FAQCard key={f.ch} faq={f} index={i} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
