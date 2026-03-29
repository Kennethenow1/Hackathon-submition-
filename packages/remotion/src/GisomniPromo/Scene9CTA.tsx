import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { GradientMeshBg } from "./GradientMeshBg";
import { Particles } from "./Particles";
import { LensFlare } from "./LensFlare";
import { outfitFamily, spaceGroteskFamily } from "./fonts";

export const Scene9CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background bloom
  const bloomOp = interpolate(frame, [0, 32], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bloomScale = interpolate(frame, [0, 32], [0.96, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // GISOMNI word-by-word
  const brandLetters = ["G", "I", "S", "O", "M", "N", "I"];
  const brandEntries = brandLetters.map((_, i) => {
    return spring({
      frame: frame - 10 - i * 4,
      fps,
      config: { damping: 14, stiffness: 80 },
    });
  });

  // Shimmer effect
  const shimmerX = interpolate(frame, [10, 70], [-100, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Label
  const labelOp = interpolate(frame, [38, 58], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tagline
  const tagOp = interpolate(frame, [38, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [38, 70], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // CTA button
  const btnSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 14, stiffness: 70 },
  });
  const btnY = interpolate(btnSpring, [0, 1], [40, 0]);
  const btnGlow = interpolate(Math.sin(frame * 0.06), [-1, 1], [0, 12]);

  // Ring behind wordmark
  const ringOp = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.05, 0.12]);

  // Final hold micro motion
  const floatY = Math.sin(frame * 0.03) * 2;

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bloomOp,
          transform: `scale(${bloomScale})`,
        }}
      >
        <GradientMeshBg
          colors={["#444444", "#999999", "#ffffff", "#bbbbbb"]}
          baseColor="#111111"
        />
      </div>

      <Particles count={12} color="rgba(255,255,255,0.3)" maxSize={2.5} speed={0.2} seed={200} />
      <LensFlare x={50} y={40} size={500} color="#ffffff" />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          transform: `translateY(${floatY}px)`,
        }}
      >
        {/* Ring behind wordmark */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            border: `1px solid rgba(255,255,255,${ringOp})`,
            pointerEvents: "none" as const,
          }}
        />

        {/* Micro label */}
        <div
          style={{
            fontFamily: spaceGroteskFamily,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase" as const,
            color: "#999999",
            marginBottom: 20,
            opacity: labelOp,
          }}
        >
          Interactive Geospatial Platform
        </div>

        {/* Brand wordmark */}
        <div
          style={{
            display: "flex",
            gap: 4,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {brandLetters.map((l, i) => {
            const s = brandEntries[i] ?? 0;
            return (
              <span
                key={i}
                style={{
                  fontFamily: outfitFamily,
                  fontWeight: 200,
                  fontSize: 110,
                  color: "#ffffff",
                  letterSpacing: "0.06em",
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
                  display: "inline-block",
                }}
              >
                {l}
              </span>
            );
          })}
          {/* Shimmer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `${shimmerX}%`,
              width: 80,
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              pointerEvents: "none" as const,
            }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: spaceGroteskFamily,
            fontSize: 20,
            fontWeight: 400,
            color: "#aaaaaa",
            marginTop: 20,
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            textAlign: "center",
          }}
        >
          Interactive Geospatial Mapping Solutions for global impact.
        </div>

        {/* CTA Button */}
        <div
          style={{
            marginTop: 44,
            padding: "14px 40px",
            background: "#ffffff",
            color: "#111111",
            borderRadius: 6,
            fontFamily: spaceGroteskFamily,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.04em",
            opacity: btnSpring,
            transform: `translateY(${btnY}px)`,
            boxShadow: `0 ${4 + btnGlow}px ${20 + btnGlow * 2}px rgba(255,255,255,${0.08 + btnGlow * 0.01})`,
          }}
        >
          gisomni.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
