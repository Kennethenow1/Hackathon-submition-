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
import { FlyerAppUI } from "./FlyerAppUI";

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser springs in
  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 80, mass: 1.2 } });
  const enterYTranslate = interpolate(enter, [0, 1], [120, 0]);
  const enterScale = interpolate(enter, [0, 1], [0.70, 1.0]);
  const enterOpacity = interpolate(enter, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  // Perspective settle
  const rotateY = interpolate(enter, [0, 1], [14, 10], { extrapolateRight: "clamp" });

  // Cinematic push-in
  const cameraScale = interpolate(frame, [36, 120], [1.0, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Cursor movement: enters frame 44, moves toward upload area
  const cursorProg = interpolate(frame, [44, 78], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const curX = interpolate(cursorProg, [0, 1], [130, 960]);
  const curY = interpolate(cursorProg, [0, 1], [900, 580]);

  // Hover glow on drop zone
  const hoverGlow = interpolate(frame, [78, 94], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Gentle drift
  const driftY = Math.sin(frame * 0.023) * 4;

  // Exit
  const exitOp = interpolate(frame, [105, 135], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <GradientMesh intensity={1} tint="neutral" />
      <GlowOrb x="20%" y="30%" size={350} color="rgba(79, 70, 229, 0.15)" />
      <GlowOrb x="80%" y="70%" size={280} color="rgba(64, 104, 255, 0.12)" phase={2} />
      <OrbitRing size={500} x="50%" y="50%" speed={0.15} />
      <ParticleField count={16} />

      {/* Cinematic camera scale wrapper */}
      <AbsoluteFill
        style={{
          transform: `scale(${cameraScale})`,
          transformOrigin: "center center",
          opacity: exitOp,
        }}
      >
        { /* Floating Browser */ }
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, calc(-50% + ${enterYTranslate}px + ${driftY}px)) scale(${enterScale})`,
            opacity: enterOpacity,
          }}
        >
          <FloatingBrowser
            url="flyer.it.com"
            width={1160}
            rotateX={-6}
            rotateY={rotateY}
            scale={0.84}
            darkMode={false}
            enterDelay={0}
            durationInFrames={120}
          >
            <FlyerAppUI hoverGlow={hoverGlow} showPreview={false} />
          </FloatingBrowser>
        </div>

        { /* Cursor over browser area */ }
        <Cursor x={curX} y={curY} visible={frame >= 44} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
