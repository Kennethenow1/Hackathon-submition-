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
  Cursor,
  COLORS,
  FONT_FAMILY,
} from "./shared";

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter
  const enterOp = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Calendar row focus (soft blur the rest)
  const focusProgress = interpolate(frame, [18, 46], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Cursor moves to Connect button
  const cursorProg = interpolate(frame, [42, 74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const curX = interpolate(cursorProg, [0, 1], [600, 1075]);
  const curYCoord = interpolate(cursorProg, [0, 1], [600, 612]);
  const isClicking = frame >= 74 && frame < 88;

  // Success confirmation slides up
  const successSpring = spring({ frame: frame - 100, fps, config: { damping: 22, stiffness: 80 } });
  const successY = interpolate(successSpring, [0, 1], [60, 0]);
  const successOp = interpolate(successSpring, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  // Glow pulse around success
  const successGlow = frame >= 128 ? 0.5 + Math.sin((frame - 128) * 0.12) * 0.3 : 0;

  // Exit
  const exitOp = interpolate(frame, [150, 170], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: enterOp }}>
      <GradientMesh intensity={1} tint="success" />
      <GlowOrb x="50%" y="50%" size={500} color="rgba(16, 185, 129, 0.12)" />
      <OrbitRing size={300} x="50%" y="65%" speed={0.2} color="rgba(16,185,129,0.1)" />
      <ParticleField count={12} color="rgba(16, 185, 129, 0.15)" />

      <AbsoluteFill style={{ opacity: exitOp }}>
        { /* Floating browser */ }
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "47%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <FloatingBrowser
            url="flyer.it.com"
            width={1160}
            rotateX={-4}
            rotateY={8}
            scale={0.85}
            darkMode={false}
            enterDelay={0}
            durationInFrames={170}
          >
            {/* Calendar row section */}
            <div
              style={{
                fontFamily: FONT_FAMILY,
                background: "#f8f9fa",
                minHeight: 740,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "24px 16px",
                gap: 16,
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.primary, letterSpacing: "-1px" }}>Flyer</div>

              <div style={{
                background: COLORS.card,
                borderRadius: 24,
                boxShadow: "0 12px 36px -8px rgba(0,0,0,0.10)",
                padding: "24px 24px",
                width: 1070,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}>
                { /* header */ }
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>Scan Your Flyer</div>
                  <div style={{ fontSize: 14, color: COLORS.textMuted, marginTop: 4 }}>Extract event details instantly with AI</div>
                </div>

                {/* Upload drop zone placeholder - compact */}
                <div style={{
                  border: `2px dashed rgba(79, 70, 229, 0.2)`,
                  borderRadius: 16,
                  padding: "20px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  opacity: 0.5,
                }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.textMuted }}>Drop your image or PDF here</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>Supports PNG, JPG, PDF</div>
                </div>

                {/* Calendar connection row - focused */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    background: COLORS.surface,
                    borderRadius: 16,
                    border: `1px solid rgba(79,70,229,${0.15 + focusProgress * 0.3})`,
                    boxShadow: `0 2px 16px -4px rgba(79,70,229,${focusProgress * 0.12})`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #4068ff 0%, #2244ff 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontWeight: 700, fontSize: 12 }}>G</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>Google Calendar</div>
                      <div style={{ fontSize: 13, color: COLORS.textMuted }}>Not connected</div>
                    </div>
                  </div>
                  <button style={{
                    background: COLORS.primary,
                    border: "none",
                    borderRadius: 12,
                    padding: "8px 20px",
                    fontFamily: FONT_FAMILY,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "white",
                    cursor: "default",
                    transform: `scale(${isClicking ? 0.96 : 1})`,
                    boxShadow: `0 4px 12px -4px rgba(79,70,229,${isClicking ? 0.6 : 0.3})`,
                  }}>Connect</button>
                </div>

                {/* Success confirmation */}
                {frame >= 100 && (
                  <div
                    style={{
                      transform: `translateY(${successY}px)`,
                      opacity: successOp,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 20px",
                      background: "linear-gradient(135deg, #f0fdf4 40%, #dcfce7 100%)",
                      borderRadius: 16,
                      border: `1px solid rgba(16,185,129,${0.2 + successGlow * 0.2})`,
                      boxShadow: `0 8px 24px -8px rgba(16,185,129,${0.1 + successGlow * 0.1})`,
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#10b981",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#065f46", fontFamily: FONT_FAMILY }}>Event added to calendar</div>
                      <div style={{ fontSize: 13, color: "#057A55", fontFamily: FONT_FAMILY }}>Annual Summer Festival - July 12, 2025</div>
                    </div>
                    <button style={{
                      background: "#10b981",
                      border: "none",
                      borderRadius: 10,
                      padding: "6px 16px",
                      fontFamily: FONT_FAMILY,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "white",
                      cursor: "default",
                    }}>View</button>
                  </div>
                )}
              </div>
            </div>
          </FloatingBrowser>
        </div>

        {/* Cursor */}
        <Cursor x={curX} y={curYCoord} visible={frame >= 40} clicking={isClicking} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
