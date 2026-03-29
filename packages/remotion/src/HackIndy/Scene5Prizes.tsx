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
  LensFlare,
  GlassPanel,
  MetricCounter,
  OrbitRing,
} from "./helpers";

const { fontFamily } = loadInter();

const podium = [
  { place: "2nd", label: "Runner Up", height: 240, color: "#C0C0C0" },
  { place: "1st", label: "Grand Prize", height: 320, color: COLORS.racingGold },
  { place: "3rd", label: "Third Place", height: 180, color: "#CD7F32" },
];

const mlhPrizes = [
  "ElevenLabs",
  "Gemini API",
  "Solana",
  "Vultr",
  "MongoDB Atlas",
];

export const Scene5Prizes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Camera
  const zoom = interpolate(frame, [36, 180], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const widen = interpolate(frame, [180, 240], [1.05, 0.98], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const finalScale = frame < 180 ? zoom : widen;

  // Exit
  const exitO = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
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
      <GradientMeshBg goldIntensity={0.55} greenIntensity={0.05} />
      <Particles count={24} color="rgba(212,168,83,0.35)" />
      <LensFlare x={50} y={30} size={450} />
      <LensFlare x={20} y={80} size={200} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${finalScale})`,
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: COLORS.racingGold,
            fontFamily: "monospace",
            marginBottom: 8,
          }}
        >
          VICTORY LANE
        </div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            color: COLORS.textPrimary,
            marginBottom: 40,
          }}
        >
          Prizes
        </div>

        {/* Podium */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 20,
            position: "relative",
          }}
        >
          {/* Orbit ring behind champion */}
          <div
            style={{
              position: "absolute",
              left: "33%",
              top: "-20%",
            }}
          >
            <OrbitRing size={380} speed={0.2} />
          </div>

          {podium.map((p, i) => {
            const delay = i === 1 ? 18 : 10 + i * 4;
            const s = spring({
              frame: frame - delay,
              fps,
              config:
                i === 1
                  ? { damping: 10, stiffness: 100 }
                  : { damping: 20, stiffness: 90 },
            });
            const rise = interpolate(s, [0, 1], [80, 0]);
            const isChampion = i === 1;
            const glow =
              isChampion && frame > 34
                ? interpolate(
                    Math.sin(frame * 0.06),
                    [-1, 1],
                    [0.3, 0.8]
                  )
                : 0;

            return (
              <div
                key={p.place}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transform: `translateY(${rise}px)`,
                  opacity: s,
                }}
              >
                <div
                  style={{
                    width: isChampion ? 200 : 160,
                    padding: 16,
                    borderRadius: 16,
                    background: "rgba(17,17,22,0.85)",
                    border: `1px solid ${p.color}60`,
                    textAlign: "center",
                    marginBottom: 12,
                    boxShadow: isChampion
                      ? `0 0 ${glow * 40}px ${COLORS.racingGold}44`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: isChampion ? 32 : 24,
                      fontWeight: 800,
                      color: p.color,
                    }}
                  >
                    {p.place}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    {p.label}
                  </div>
                </div>
                {/* Podium stand */}
                <div
                  style={{
                    width: isChampion ? 200 : 160,
                    height: p.height * s,
                    background: `linear-gradient(180deg, ${p.color}20, ${p.color}08)`,
                    border: `1px solid ${p.color}30`,
                    borderRadius: "8px 8px 0 0",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* $5K+ stat */}
        <div
          style={{
            marginTop: 30,
            opacity: interpolate(
              spring({
                frame: frame - 42,
                fps,
                config: { damping: 200 },
              }),
              [0, 1],
              [0, 1]
            ),
          }}
        >
          <GlassPanel style={{ textAlign: "center" }}>
            <MetricCounter
              value={5}
              prefix="$"
              suffix="K+ in Prizes"
              delay={42}
              fontSize={36}
            />
          </GlassPanel>
        </div>

        {/* MLH prize grid */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 24,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {mlhPrizes.map((prize, i) => {
            const ps = spring({
              frame: frame - 132 - i * 6,
              fps,
              config: { damping: 16, stiffness: 100 },
            });
            const rot = interpolate(ps, [0, 1], [4, 0]);
            return (
              <div
                key={prize}
                style={{
                  padding: "10px 18px",
                  borderRadius: 12,
                  background: "rgba(17,17,22,0.8)",
                  border: `1px solid ${COLORS.borderGold}`,
                  color: COLORS.textSecondary,
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: ps,
                  transform: `rotate(${rot}deg) translateY(${interpolate(
                    ps,
                    [0, 1],
                    [20, 0]
                  )}px)`,
                }}
              >
                {prize}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
