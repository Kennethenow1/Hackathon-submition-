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
  OrbitRing,
  WordStagger,
  RacingBadge,
} from "./helpers";

const { fontFamily } = loadInter();

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Logo reveal
  const logoS = spring({
    frame: frame - 8,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // 2026
  const yearS = spring({
    frame: frame - 26,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  // Badges
  const badgeS1 = spring({
    frame: frame - 42,
    fps,
    config: { damping: 200 },
  });
  const badgeS2 = spring({
    frame: frame - 56,
    fps,
    config: { damping: 200 },
  });

  // CTA button
  const ctaS = spring({
    frame: frame - 70,
    fps,
    config: { damping: 12, stiffness: 120 },
  });
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);

  // Tagline + URL
  const tagS = spring({
    frame: frame - 96,
    fps,
    config: { damping: 200 },
  });

  // Shimmer on logo
  const shimmerX = interpolate(frame, [0, 90], [-300, 600]);

  // End fade
  const endFade = interpolate(
    frame,
    [durationInFrames - 42, durationInFrames - 10],
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
      <GradientMeshBg goldIntensity={0.6} greenIntensity={0.1} />
      <Particles count={20} color="rgba(212,168,83,0.4)" />
      <LensFlare x={50} y={40} size={500} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: endFade,
        }}
      >
        {/* Orbit ring */}
        <div style={{ position: "absolute" }}>
          <OrbitRing size={500} speed={0.15} />
          <OrbitRing
            size={320}
            speed={-0.2}
            dashArray="4 8"
            color="rgba(212,168,83,0.08)"
          />
        </div>

        {/* HACK INDY with shimmer */}
        <div
          style={{
            transform: `scale(${interpolate(logoS, [0, 1], [0.5, 1])})`,
            opacity: logoS,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 100,
              fontWeight: 900,
              letterSpacing: "0.05em",
              background: `linear-gradient(90deg, ${COLORS.textPrimary} 0%, ${COLORS.racingGold} 50%, ${COLORS.textPrimary} 100%)`,
              backgroundSize: "200% 100%",
              backgroundPosition: `${shimmerX}px 0`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            HACK INDY
          </div>
        </div>

        {/* 2026 */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: COLORS.racingGold,
            letterSpacing: "0.1em",
            transform: `translateY(${interpolate(yearS, [0, 1], [40, 0])}px)`,
            opacity: yearS,
            textShadow: `0 0 20px ${COLORS.racingGold}66`,
          }}
        >
          2026
        </div>

        {/* Badges */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 24,
          }}
        >
          <div
            style={{
              opacity: badgeS1,
              transform: `translateY(${interpolate(badgeS1, [0, 1], [20, 0])}px)`,
            }}
          >
            <RacingBadge text="🏎 Purdue Indianapolis" />
          </div>
          <div
            style={{
              opacity: badgeS2,
              transform: `translateY(${interpolate(badgeS2, [0, 1], [20, 0])}px)`,
            }}
          >
            <RacingBadge text="📅 Fri 3/27 - Sun 3/29" />
          </div>
        </div>

        {/* CTA Button */}
        <div
          style={{
            marginTop: 36,
            transform: `scale(${interpolate(ctaS, [0, 1], [0.7, 1])})`,
            opacity: ctaS,
          }}
        >
          <div
            style={{
              padding: "16px 48px",
              border: `2px solid ${COLORS.racingGold}`,
              borderRadius: 12,
              background: COLORS.goldBgFaint,
              color: COLORS.racingGold,
              fontSize: 20,
              fontWeight: 700,
              boxShadow: `0 12px 28px -8px ${COLORS.racingGold}${Math.round(
                glowPulse * 70
              )
                .toString(16)
                .padStart(2, "0")}`,
            }}
          >
            Register on Devpost
          </div>
        </div>

        {/* Tagline + URL */}
        <div
          style={{
            marginTop: 32,
            opacity: tagS,
            transform: `translateY(${interpolate(tagS, [0, 1], [15, 0])}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.textSecondary,
              letterSpacing: "0.05em",
            }}
          >
            Start Your Engines
          </div>
          <div
            style={{
              fontSize: 14,
              color: COLORS.textMuted,
              marginTop: 8,
            }}
          >
            hackindy.io
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
