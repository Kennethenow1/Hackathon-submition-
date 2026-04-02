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
  GlowOrb,
  COLORS,
  FONT_FAMILY,
} from "./shared";

// Manual fields to show in right panel
const MANUAL_FIELDS = [
  { label: "Event title", value: "Annual Summer Festival" },
  { label: "Date", value: "July 12, 2025" },
  { label: "Time", value: "7:00 PM" },
  { label: "Location", value: "City Park Amphitheater" },
];

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene enter
  const enterOp = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Left panel slide in
  const leftSpring = spring({ frame, fps, config: { damping: 22, stiffness: 100 } });
  const leftX = interpolate(leftSpring, [0, 1], [-80, 0]);
  const leftRotate = interpolate(leftSpring, [0, 1], [-2, 0]);

  // Right panel slide in
  const rightSpring = spring({ frame, fps, config: { damping: 22, stiffness: 100 } });
  const rightX = interpolate(rightSpring, [0, 1], [80, 0]);

  // Floating animation for panels
  const panelFloat = Math.sin(frame * 0.025) * 4;

  // Right panel dims later
  const rightDim = interpolate(frame, [50, 86], [1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade
  const exitOp = interpolate(frame, [110, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  // Divider glow
  const dividerGlow = 0.5 + Math.sin(frame * 0.04) * 0.25;

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: enterOp }}>
      <GradientMesh intensity={0.8} tint="neutral" />
      <GlowOrb x="20%" y="50%" size={300} color="rgba(79, 70, 229, 0.15)" />
      <GlowOrb x="80%" y="40%" size={250} color="rgba(64, 104, 255, 0.12)" phase={2} />
      <ParticleField count={10} />

      { /* Content layer */ }
      <AbsoluteFill style={{ opacity: exitOp }}>
        { /* Left panel - flyer mockup */ }
        <div
          style={{
            position: "absolute",
            left: "7%",
            top: "50%",
            transform: `translate(${leftX}px, calc(-50% + ${panelFloat}px)) rotateZ(${leftRotate}deg)`,
            width: 720,
            height: 500,
            background: "linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%)",
            borderRadius: 24,
            boxShadow: "0 24px 60px -16px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            overflow: "hidden",
          }}
        >
          {/* Flyer visual mockup */}
          <div style={{ width: "80%", height: 24, background: "rgba(220,34,55,0.6)", borderRadius: 6 }} />
          <div style={{ width: "90%", height: 128, background: "rgba(255, 255, 255, 0.5)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(220,34,55,0.3)"/>
              <text x="6" y="16" fontFamily="system-ui" fontSize="10" fill="rgba(220,34,55,0.8)">EVENT</text>
            </svg>
          </div>
          <div style={{ width: "80%", height: 16, background: "rgba(0, 0, 0, 0.12)", borderRadius: 4 }} />
          <div style={{ width: "60%", height: 12, background: "rgba(0, 0, 0, 0.08)", borderRadius: 4 }} />
          <div style={{ width: "70%", height: 12, background: "rgba(0, 0, 0, 0.08)", borderRadius: 4 }} />
          <span style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.primary,
            background: "rgba(255,255,255,0.8)",
            padding: "3px 8px",
            borderRadius: 8,
          }}>Flyer</span>
        </div>

        {/* Divider */}
        <div
          style={{
            position: "absolute",
            left: "52%",
            top: "5%",
            width: 3,
            height: "90%",
            background: `linear-gradient(180deg, transparent 0%, rgba(79,70,229,${dividerGlow}) 50%, transparent 100%)`,
            borderRadius: 2,
          }}
        />

        { /* Right panel - manual entry */ }
        <div
          style={{
            position: "absolute",
            right: "7%",
            top: "50%",
            transform: `Translate(${rightX}px, calc(-50% + ${-panelFloat}px))`,
            width: 660,
            height: 480,
            background: COLORS.card,
            borderRadius: 24,
            boxShadow: "0 24px 60px -16px rgba(0,0,0,0.12)",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            opacity: rightDim,
          }}
        >
          <span style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.textMuted,
            background: COLORS.surface,
            padding: "3px 8px",
            borderRadius: 8,
          }}>Manual entry</span>
          { MANUAL_FIELDS.map((field, i) => {
            const fieldSpring = spring({ frame: frame - (18 + i * 8), fps, config: { damping: 20 } });
            const fy = interpolate(fieldSpring, [0, 1], [16, 0]);
            const fo = interpolate(fieldSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                transform: `translateY(${fy}px)`,
                opacity: fo,
              }}>
                <div style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 13,
                  fontWeight: 500,
                  color: COLORS.textMuted,
                  marginBottom: 6,
                }}>{field.label}</div>
                <div style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 20,
                  fontWeight: 500,
                  color: COLORS.text,
                  background: COLORS.surface,
                  borderRadius: 12,
                  padding: "8px 14px",
                  border: `1px solid ${COLORS.border}`,
                }}>{field.value}</div>
              </div>
            );
          })}
        </div>

        { /* Bottom caption */ }
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: "0",
            right: "0",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <span style={{
            fontFamily: FONT_FAMILY,
            fontSize: 22,
            fontWeight: 500,
            color: COLORS.textMuted,
            opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
          }}>
            Extract event details instantly with AI
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
