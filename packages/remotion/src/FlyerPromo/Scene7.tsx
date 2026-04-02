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
  GlowOrb,
  Cursor,
  COLORS,
  FONT_FAMILY,
} from "./shared";
import { FlyerAppUI } from "./FlyerAppUI";

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter
  const enterOp = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Cursor to Take a Photo button
  const cursorProg = interpolate(frame, [22, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const curX = interpolate(cursorProg, [0, 1], [700, 970]);
  const curYCoord = interpolate(cursorProg, [0, 1], [600, 580]);
  const isClicking = frame >= 52 && frame < 66;

  // Modal enters
  const modalSpring = spring({ frame: frame - 52, fps, config: { damping: 22, stiffness: 90 } });
  const modalScale = interpolate(modalSpring, [0, 1], [0.94, 1.0]);
  const modalY = interpolate(modalSpring, [0, 1], [24, 0]);
  const modalOp = interpolate(modalSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });
  const showModal = frame >= 52;

  // Capture button pulse
  const capturePulse = frame >= 90 && frame <= 120
    ? 0.85 + Math.sin((frame - 90) * 0.24) * 0.15
    : 1;

  // Exit
  const exitOp = interpolate(frame, [140, 168], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: enterOp }}>
      <GradientMesh intensity={1} tint="camera" />
      <GlowOrb x="50%" y="50%" size={400} color="rgba(64, 104, 255, 0.12)" />
      <ParticleField count={8} />

      <AbsoluteFill style={{ opacity: exitOp }}>
        {/* Base browser with Take a Photo button */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <FloatingBrowser
            url="flyer.it.com"
            width={1160}
            rotateX={-3}
            rotateY={8}
            scale={0.85}
            darkMode={false}
            enterDelay={0}
            durationInFrames={168}
          >
            <FlyerAppUI hoverGlow={0} showPreview={false} />
          </FloatingBrowser>
        </div>

        {/* Camera modal */}
        {showModal && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `rgba(0,0,0,0.${Math.round(modalOp * 45)})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Modal content */}
            <div
              style={{
                background: COLORS.card,
                borderRadius: 24,
                boxShadow: "0 24px 60px -16px rgba(0,0,0,0.22)",
                width: 720,
                overflow: "hidden",
                transform: `scale(${modalScale}) translateY(${modalY}px)`,
                opacity: modalOp,
              }}
            >
              {/* modal header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 20px",
                borderBottom: `1px solid ${COLORS.border}`,
                opacity: interpolate(frame - 52, [10, 28], [0, 1], { extrapolateRight: "clamp" }),
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={COLORS.primary} strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l6-9h4l6 9z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: 17, fontWeight: 700, color: COLORS.text }}>Take a Photo</span>
                </div>
                <button style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: COLORS.surface, border: "none",
                  fontSize: 18, cursor: "default",
                  color: COLORS.textMuted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>x</button>
              </div>

              {/* camera preview area */}
              <div
                style={{
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  opacity: interpolate(frame - 52, [16, 32], [0, 1], { extrapolateRight: "clamp" }),
                }}
              >
                {/* video area placeholder */}
                <div style={{
                  width: "95%",
                  height: 280,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}>
                  { /* simulated camera feed */ }
                  <div style={{ position: "absolute", inset: 0, opacity: 0.3 }}>
                    {/* scanlines effect */}
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: `${i * 12 + 1}%`,
                        height: 1,
                        background: "rgba(255,255,255,0.1)",
                      }} />
                    ))}
                  </div>
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l6-9h4l6 9z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>

                {/* capture button */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 0px ${Math.round(capturePulse * 20)}px rgba(79,70,229,0.4)`,
                    transform: `scale(${capturePulse})`,
                  }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M17.92 5.37h-.01a12 12 0 0 0-2.15-2.14h-.01a5.43 5.43 0 0 0-7.51 0h-.01A12 12 0 0 0 6.09 5.37H4a2 2 0 0 0-2 2v108 2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7.37a2 2 0 0 0-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
            </div>
          )}

        {/* Cursor */}
        <Cursor x={curX} y={curYCoord} visible={frame >= 20} clicking={isClicking} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
