import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from "remotion";
import {
  GradientMesh,
  ParticleField,
  OrbitRing,
  GlowOrb,
  BlurTextWords,
  COLORS,
  FONT_FAMILY,
} from "./shared";

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background bloom
  const bloomIntensity = interpolate(frame, [0, 18], [0.5, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // "Flyer" wordmark reveal
  const logoSpring = spring({ frame: frame - 8, fps, config: { damping: 20, stiffness: 90 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.9, 1.0]);
  const logoOpacity = interpolate(logoSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
  const logoGlow = interpolate(logoSpring, [0, 1], [0, 24]);

  // Shimmer across logo after frame 54
  const shimmerX = interpolate(frame, [54, 84], [-120, 120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // URL fade
  const urlOp = interpolate(frame, [36, 72], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Ambient float
  const textFloat = Math.sin(frame * 0.025) * 1.5;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <GradientMesh intensity={bloomIntensity} tint="cta" />
      <GlowOrb x="20%" y="30%" size={450} color="rgba(79, 70, 229, 0.25)" />
      <GlowOrb x="80%" y="65%" size={350} color="rgba(64, 104, 255, 0.2)" phase={2} />
      <OrbitRing size={500} x="50%" y="50%" speed={0.15} />
      <OrbitRing size={350} x="50%" y="50%" speed={-0.08} dashArray="12 6" />
      <ParticleField count={16} />

      { /* Faint browser card silhouette */ }
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 960,
          height: 580,
          borderRadius: 24,
          background: COLORS.card,
          opacity: 0.05,
        }}
      />

      { /* Main content stack */ }
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          transform: `translateY(${textFloat}px)`,
        }}
      >
        {/* Flyer logo reveal */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 132,
              fontWeight: 800,
              color: COLORS.primary,
              letterSpacing: "-3px",
              lineHeight: 1,
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
              filter: `drop-shadow(0px 0px ${logoGlow}px rgba(79,70,229,0.4))`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            Flyer
            {/* shimmer overlay */}
            {frame >= 54 && frame <= 84 && (
              <div style={{
                position: "absolute",
                top: 0,
                left: `calc(${shimmerX}px - 30%)`,
                width: "30%",
                height: "100%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                pointerEvents: "none",
              }} />
            )}
          </div>
        </div>

        {/* Scan Your Flyer */}
        <BlurTextWords
          text="Scan Your Flyer"
          startFrame={18}
          wordDelay={6}
          fontSize={56}
          fontWeight={600}
          color={COLORS.text}
        />

        {/* Subtitle */}
        <BlurTextWords
          text="Extract event details instantly with AI"
          startFrame={28}
          wordDelay={4}
          fontSize={32}
          fontWeight={400}
          color={COLORS.textMuted}
        />

        {/* URL */}
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 24,
            fontWeight: 500,
            color: COLORS.textMuted,
            opacity: urlOp,
            letterSpacing: "0.05em",
          }}
        >
          flyer.it.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
