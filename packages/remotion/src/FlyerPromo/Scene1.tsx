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

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const bgScale = interpolate(frame, [0, 18], [1.06, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Flyer title: frames 6-28, blur reveal
  const flyerProgress = spring({
    frame: frame - 6,
    fps,
    config: { damping: 22, stiffness: 90 },
  });
  const flyerBlur = interpolate(flyerProgress, [0, 1], [12, 0], { extrapolateRight: "clamp" });
  const flyerOpacity = interpolate(flyerProgress, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const flyerY = interpolate(flyerProgress, [0, 1], [-36, 0], { extrapolateRight: "clamp" });

  // Ambient float on main text
  const textFloat = Math.sin(frame * 0.03) * 1.5;

  // Exit: frames 72-90
  const exitOpacity = interpolate(frame, [72, 95], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Upload card silhouette
  const cardReady = spring({ frame: frame - 20, fps, config: { damping: 20 } });
  const cardOpacity = interpolate(cardReady, [0, 1], [0, 0.06], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* Background mesh */}
      <div style={{ opacity: bgOpacity, transform: `scale(${bgScale})`, width: "100%", height: "100%" }}>
        <GradientMesh intensity={1} tint="neutral" />
      </div>

      {/* Mid-layer decorations */}
      <GlowOrb x="15%" y="30%" size={400} color="rgba(79, 70, 229, 0.25)" />
      <GlowOrb x="80%" y="60%" size={300} color="rgba(64, 104, 255, 0.2)" phase={2} />
      <OrbitRing size={400} x="50%" y="50%" speed={0.2} />
      <ParticleField count={12} />

      {/* Upload card silhouette - behind text */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 840,
          height: 560,
          borderRadius: 32,
          background: COLORS.card,
          opacity: cardOpacity,
          boxShadow: "0 24px 60px -16px rgba(0, 0, 0, 0.12)",
        }}
      />

      {/* Main content stack */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          opacity: exitOpacity,
          transform: `translateY(${textFloat}px)`,
        }}
      >
        {/* "flyer" wordmark with blur reveal */}
        <div
          style={{
            filter: `blur(${flyerBlur}px)`,
            opacity: flyerOpacity,
            transform: `translateY(${flyerY}px)`,
            fontFamily: FONT_FAMILY,
            fontSize: 120,
            fontWeight: 800,
            color: COLORS.primary,
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          Flyer
        </div>

        {/* "Scan Your Flyer" word-by-word */}
        <BlurTextWords
          text="Scan Your Flyer"
          startFrame={18}
          wordDelay={4}
          fontSize={56}
          fontWeight={600}
          color={COLORS.text}
        />

        {/* "Extract event details instantly with AI" word-by-word */}
        <BlurTextWords
          text="Extract event details instantly with AI"
          startFrame={28}
          wordDelay={3}
          fontSize={30}
          fontWeight={400}
          color={COLORS.textMuted}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
