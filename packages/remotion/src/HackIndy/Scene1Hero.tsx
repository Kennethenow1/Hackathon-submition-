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
  LensFlare,
  WordStagger,
  RacingBadge,
} from "./helpers";

const { fontFamily } = loadInter();

// Racing lights
const RacingLights: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        justifyContent: "center",
        marginBottom: 24,
      }}
    >
      {[0, 1, 2].map((i) => {
        const s = spring({
          frame: frame - i * 5,
          fps,
          config: { damping: 10, stiffness: 150 },
        });
        const glow = interpolate(
          frame - i * 5,
          [0, 8, 18],
          [0, 1, 0.4],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <div
            key={i}
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background:
                i < 2 ? COLORS.racingGold : COLORS.greenLive,
              transform: `scale(${s})`,
              boxShadow: `0 0 ${glow * 25}px ${
                i < 2 ? COLORS.racingGold : COLORS.greenLive
              }`,
            }}
          />
        );
      })}
    </div>
  );
};

export const Scene1Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Camera push-in
  const zoom = interpolate(frame, [60, 160], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Exit
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - 40, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitScale = interpolate(
    frame,
    [durationInFrames - 40, durationInFrames],
    [1, 1.02],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Countdown badge
  const badgeS = spring({
    frame: frame - 8,
    fps,
    config: { damping: 20, stiffness: 100 },
  });
  const badgeY = interpolate(badgeS, [0, 1], [-30, 0]);
  const badgeScale = interpolate(badgeS, [0, 1], [0.92, 1]);

  // 2026 glow
  const yearS = spring({
    frame: frame - 40,
    fps,
    config: { damping: 16, stiffness: 90 },
  });
  const yearY = interpolate(yearS, [0, 1], [50, 0]);
  const yearGlow = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.7]
  );

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgPrimary,
        fontFamily,
      }}
    >
      <GradientMeshBg goldIntensity={0.5} greenIntensity={0.12} />
      <ScanlineOverlay />
      <Particles count={18} />
      <LensFlare x={75} y={25} size={400} />
      <LensFlare x={25} y={65} size={250} color={COLORS.greenLive} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom * exitScale})`,
          opacity: exitOpacity,
        }}
      >
        <RacingLights />

        {/* Countdown badge */}
        <div
          style={{
            transform: `translateY(${badgeY}px) scale(${badgeScale})`,
            opacity: badgeS,
            marginBottom: 20,
          }}
        >
          <RacingBadge text="⏱ MARCH 27-29, 2026" />
        </div>

        {/* HACK INDY */}
        <WordStagger
          text="HACK INDY"
          startFrame={16}
          stagger={8}
          fontSize={120}
          fontWeight={900}
          letterSpacing="0.05em"
        />

        {/* 2026 */}
        <div
          style={{
            transform: `translateY(${yearY}px)`,
            opacity: yearS,
            fontSize: 90,
            fontWeight: 900,
            color: COLORS.racingGold,
            letterSpacing: "0.1em",
            textShadow: `0 0 ${yearGlow * 30}px ${COLORS.racingGold}88`,
            marginTop: 10,
          }}
        >
          2026
        </div>

        {/* Location badge */}
        <div
          style={{
            marginTop: 28,
            opacity: interpolate(
              spring({
                frame: frame - 56,
                fps,
                config: { damping: 200 },
              }),
              [0, 1],
              [0, 1]
            ),
            transform: `translateY(${interpolate(
              spring({
                frame: frame - 56,
                fps,
                config: { damping: 200 },
              }),
              [0, 1],
              [20, 0]
            )}px)`,
          }}
        >
          <RacingBadge text="🏎 PURDUE INDIANAPOLIS" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
