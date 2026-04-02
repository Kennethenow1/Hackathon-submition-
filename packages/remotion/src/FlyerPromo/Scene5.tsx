import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from "remotion";
import { FloatingBrowser } from "../BrowserFrame";
import {
  GradientMesh,
  ParticleField,
  OrbitRing,
  GlowOrb,
  COLORS,
  FONT_FAMILY,
} from "./shared";
import { FlyerAppUI } from "./FlyerAppUI";

const EXTRACTED_CARDS = [
  { label: "Event", value: "Annual Summer Festival", icon: "E" },
  { label: "Date", value: "July 12, 2025", icon: "D" },
  { label: "Time", value: "7:00 PM - 10:00 PM", icon: "T" },
  { label: "Location", value: "City Park Amphitheater", icon: "L "},
];

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene enter
  const enterOp = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Classmorphism panel rises
  const panelSpring = spring({ frame: frame - 0, fps, config: { damping: 22, stiffness: 80 } });
  const panelY = interpolate(panelSpring, [0, 1], [36, 0]);
  const panelOp = interpolate(panelSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  // Heading fade in
  const headingOp = interpolate(frame, [12, 30], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const textHighlightWidth = interpolate(frame, [30, 50], [0, 100], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Camera push
  const cameraScale = interpolate(frame, [96, 150], [1.0, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Cards slide leftward at end
  const cardsSlideLeft = interpolate(frame, [144, 180], [0, -80], {
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Exit fade
  const exitOp = interpolate(frame, [165, 200], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Scan shimmer sweep across flyer
  const shimmerX = interpolate(frame, [96, 120], [-20, 110], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: enterOp }}>
      <GradientMesh intensity={1} tint="neutral" />
      <GlowOrb x="70%" y="40%" size={350} color="rgba(79, 70, 229, 0.2)" />
      <OrbitRing size={400} x="70%" y="45%" speed={0.15} />
      <OrbitRing size={300} x="70%" y="45%" speed={-0.1} dashArray="12 6" />
      <ParticleField count={18} />

      {/* Cinematic camera */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale})`,
          transformOrigin: "50% 50%",
          opacity: exitOp,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "5%",
            top: "50%",
            transform: "translateY(-50%)",
            width: 680,
          }}
        >
          { /* Flyer preview with shimmer */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            <FloatingBrowser
              url="flyer.it.com"
              width={660}
              rotateX={-3}
              rotateY={5}
              scale={0.9}
              darkMode={false}
              enterDelay={0}
              durationInFrames={200}
            >
              <FlyerAppUI hoverGlow={0} showPreview={true} />
            </FloatingBrowser>
            {/* shimmer layer */}
            {frame >= 96 && frame <= 125 && (
              <div style={{
                position: "absolute",
                top: 0,
                left: `${shimmerX}%`,
                width: "15%",
                height: "100%",
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                pointerEvents: "none",
              }} />
            )}
          </div>
        </div>

        {/* Extracted info panel */}
        <div
          style={{
            position: "absolute",
            right: "3%",
            top: "50%",
            width: 640,
            transform: `Translate(${cardsSlideLeft}px, -50%)`,
            opacity: panelOp,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Glassmorphism panel background */}
          <div
            style={{
              position: "absolute",
              inset: -20,
              borderRadius: 32,
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              boxShadow: "0 16px 48px -12px rgba(0, 0, 0, 0.12)",
            }}
          />

          { /* Heading */ }
          <div style={{ position: "relative", opacity: headingOp, padding: "0 8px" }}>
            <span style={{
              position: "relative",
              fontFamily: FONT_FAMILY,
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.text,
            }}>
              Extracted <span style={{ position: "relative", zIndex: 1 }}>
                <span style={{
                  position: "absolute",
                  bottom: 2,
                  left: 0,
                  height: 8,
                  width: `${textHighlightWidth}%`,
                  background: "rgba(79, 70, 229, 0.2)",
                  borderRadius: 4,
                  zIndex: -1,
                }} />
                details
              </span>
            </span>
          </div>

          {/* Extracted cards */}
          { EXTRACTED_CARDS.map((card, i) => {
            const cardSpring = spring({
              frame: frame - (24 + i * 10),
              fps,
              config: { damping: 22, stiffness: 80 },
            });
            const cardY = interpolate(cardSpring, [0, 1], [28, 0]);
            const cardScale = interpolate(cardSpring, [0, 1], [0.96, 1.0]);
            const cardOp = interpolate(cardSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

            const valueOp = interpolate(frame, [36 + i * 10, 50 + i * 10], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });

            const floatY = Math.sin(frame * 0.025 + i * 0.8) * 3.5;

            return (
              <div
                key={i}
                style={{
                  position: "relative",
                  background: COLORS.card,
                  borderRadius: 16,
                  boyShadow: "0 8px 24px -8px rgba(0, 0, 0, 0.08)",
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  transform: `translateY(${cardY + floatY}px)`,
                  opacity: cardOp,
                }}
              >
                {/* icon */}
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: COLORS.surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_FAMILY,
                  fontSize: 16,
                  fontWeight: 700,
                  color: COLORS.primary,
                }}>{card.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.textMuted, fontFamily: FONT_FAMILY }}>{card.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.text, fontFamily: FONT_FAMILY, opacity: valueOp }}>{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
