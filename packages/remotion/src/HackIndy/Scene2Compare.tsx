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
  OrbitRing,
  ScanlineOverlay,
} from "./helpers";

const { fontFamily } = loadInter();

const problemCards = ["Elite only", "Unclear rules", "Where do I start?"];
const solutionCards = [
  "Open to everyone",
  "No experience required",
  "Any major welcome",
  "Mentors on site",
];

const Card: React.FC<{
  text?: string;
  isSolution?: boolean;
  delay?: number;
  fromDirection?: "left" | "right";
  highlight?: boolean;
}> = ({
  text = "Card",
  isSolution = false,
  delay = 0,
  fromDirection = "left",
  highlight = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 90 },
  });
  const dir = fromDirection === "left" ? -1 : 1;
  const x = interpolate(s, [0, 1], [dir * 60, 0]);
  const floatY = Math.sin(frame * 0.02 + delay) * 4;

  // Highlight sweep
  const sweep = highlight
    ? interpolate(frame, [72, 110], [0, 100], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <div
      style={{
        transform: `translateX(${x}px) translateY(${floatY}px)`,
        opacity: s,
        padding: "20px 30px",
        borderRadius: 16,
        background: isSolution
          ? "rgba(212,168,83,0.08)"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${
          isSolution ? COLORS.borderGold : "rgba(255,255,255,0.08)"
        }`,
        backdropFilter: "blur(12px)",
        marginBottom: 14,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {highlight && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "35%",
            width: `${sweep}%`,
            background: `${COLORS.racingGold}30`,
            borderRadius: 4,
          }}
        />
      )}
      <span
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: isSolution ? COLORS.racingGold : COLORS.textSecondary,
          fontFamily: "'Inter', sans-serif",
          position: "relative",
          zIndex: 1,
        }}
      >
        {isSolution ? "✅ " : "❌ "}
        {text}
      </span>
    </div>
  );
};

export const Scene2Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Divider wipe
  const divider = interpolate(frame, [54, 88], [50, 40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Camera pan toward right
  const panX = interpolate(frame, [90, 170], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Exit
  const exitO = interpolate(
    frame,
    [durationInFrames - 28, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgPrimary,
        fontFamily,
      }}
    >
      <GradientMeshBg goldIntensity={0.3} greenIntensity={0.1} />
      <ScanlineOverlay opacity={0.04} />
      <Particles count={12} />

      <AbsoluteFill
        style={{
          display: "flex",
          transform: `translateX(${panX}px)`,
          opacity: exitO,
        }}
      >
        {/* Left (problem) */}
        <div
          style={{
            width: `${divider}%`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
          }}
        >
          <div
            style={{
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: COLORS.textMuted,
              marginBottom: 24,
              fontFamily: "monospace",
            }}
          >
            Typical Hackathons
          </div>
          {problemCards.map((c, i) => (
            <Card
              key={c}
              text={c}
              delay={i * 8}
              fromDirection="left"
            />
          ))}
        </div>

        {/* Divider line */}
        <div
          style={{
            width: 2,
            background: `linear-gradient(180deg, transparent, ${COLORS.racingGold}60, transparent)`,
            alignSelf: "stretch",
          }}
        />

        {/* Right (solution) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            position: "relative",
          }}
        >
          <OrbitRing size={400} speed={0.2} />
          <div
            style={{
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: COLORS.racingGold,
              marginBottom: 24,
              fontFamily: "monospace",
            }}
          >
            Hack Indy 2026
          </div>
          {solutionCards.map((c, i) => (
            <Card
              key={c}
              text={c}
              isSolution
              delay={18 + i * 7}
              fromDirection="right"
              highlight={i < 2}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
