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
  Cursor,
  GlowOrb,
  COLORS,
  FONT_FAMILY,
} from "./shared";
import { FlyerAppUI } from "./FlyerAppUI";

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera zoom into upload area
  const zoomScale = interpolate(frame, [0, 20], [1.0, 1.35], {
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Dragged flyer asset - enters from upper-left
  const flyerEnterX = interpolate(frame, [16, 52], [0.0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const flyerX = interpolate(flyerEnterX, [0.0, 0.5], [0, 800]);
  const flyerY = interpolate(flyerEnterX, [0.0, 0.5], [0, 420]);
  const flyerRotate = interpolate(flyerEnterX, [0, 0.5], [-6, -1]);

  // Drop moment - frame 52
  const dropProgress = spring({ frame: frame - 52, fps, config: { damping: 12, stiffness: 200 } });
  const dropRipple = spring({ frame: frame - 52, fps, config: { damping: 20, stiffness: 60 } });
  const dropZoneScale = 1 - dropProgress * 0.02;
  const rippleRadius = interpolate(dropRipple, [0, 1], [0, 120]);
  const rippleOp = interpolate(dropRipple, [0, 0.5, 1], [0, 0.5, 0], { extrapolateRight: "clamp" });

  // Preview section visible after drop
  const showPreview = frame >= 56;

  // Cursor moves to Process Photo button
  const cursorProg = interpolate(frame, [104, 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const curX = interpolate(cursorProg, [0, 1], [800, 1000]);
  const curYCoord = interpolate(cursorProg, [0, 1], [360, 590]);
  const isClicking = frame >= 120 && frame < 132;

  // Exit
  const exitOp = interpolate(frame, [135, 165], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <GradientMesh intensity={1} tint="neutral" />
      <GlowOrb x="30%" y="50%" size={300} color="rgba(79, 70, 229, 0.15)" />
      <ParticleField count={14} />

      <AbsoluteFill style={{ opacity: exitOp }}>
        {/* Camera zoom wrapper */}
        <AbsoluteFill
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "50% 45%",
          }}
        >
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
              rotateX={-4}
              rotateY={6}
              scale={0.86}
              darkMode={false}
              enterDelay={0}
              durationInFrames={150}
            >
              <FlyerAppUI hoverGlow={0} showPreview={showPreview} />
            </FloatingBrowser>
          </div>
        </AbsoluteFill>

        {/* Dragged flyer asset */}
        {frame >= 16 && frame < 56 && (
          <div
            style={{
              position: "absolute",
              left: flyerX,
              top: flyerY,
              width: 120,
              height: 152,
              background: "linear-gradient(135deg, #fff7ed 0%, #fee2e2 100%)",
              borderRadius: 12,
              boxShadow: "0 12px 32px -8px rgba(0,0,0,0.28)",
              transform: `rotateZ(${flyerRotate}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(220,34,55,0.7)" strokeWidth="1.5">
              <path d="M13 2H8a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7l-4-5z"/>
              <path d="M13 2v5h5"/>
            </svg>
          </div>
        )}

        {/* Drop ripple */}
        {frame >= 52 && rippleOp > 0.01 && (
          <div
            style={{
              position: "absolute",
              left: 920,
              top: 540,
              width: rippleRadius * 2,
              height: rippleRadius * 2,
              marginLeft: -rippleRadius,
              marginTop: -rippleRadius,
              borderRadius: "50%",
              border: `2px solid rgba(79, 70, 229, ${rippleOp})`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Cursor */}
        <Cursor x={curX} y={curYCoord} visible={frame >= 100} clicking={isClicking} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
