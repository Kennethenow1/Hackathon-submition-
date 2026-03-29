import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { BrowserFrame } from "../BrowserFrame";
import { MockDashboard } from "./MockDashboard";
import { GradientMeshBg } from "./GradientMeshBg";
import { Particles } from "./Particles";
import { LensFlare } from "./LensFlare";
import { AnimatedCursor } from "./AnimatedCursor";

const SCENE_DURATION = 240;

export const Scene6Insights: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser entrance
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 55, mass: 1.1 },
  });
  const enterScale = interpolate(enterSpring, [0, 1], [0.9, 1.0]);
  const enterOp = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterRotX = interpolate(enterSpring, [0, 1], [-6, 0]);

  // Camera push
  const cameraPush = interpolate(frame, [128, 200], [1.0, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // AI panel expand
  const aiExpand = interpolate(frame, [128, 165], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Cursor targeting AI prompt chip area
  const cursorPoints = [
    { x: 600, y: 300, frame: 40 },
    { x: 1100, y: 580, frame: 90 },
    { x: 1100, y: 580, frame: 128, click: true },
    { x: 1110, y: 575, frame: 150 },
  ];

  // Exit
  const exitOp = interpolate(frame, [200, 240], [1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <GradientMeshBg
        colors={["#111111", "#444444", "#888888", "#ffffff"]}
        baseColor="#0b0b10"
      />
      <LensFlare x={75} y={20} size={350} color="#777777" />
      <LensFlare x={25} y={75} size={200} color="#555555" />
      <Particles count={10} color="rgba(255,255,255,0.15)" maxSize={2} speed={0.1} seed={99} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: enterOp * exitOp,
        }}
      >
        <div
          style={{
            perspective: 1200,
            transform: `scale(${enterScale * cameraPush})`,
          }}
        >
          <div
            style={{
              transform: `rotateX(${enterRotX}deg)`,
              transformStyle: "preserve-3d" as const,
            }}
          >
            <BrowserFrame url="gisomni.com/analytics" width={1300} shadow>
              <div style={{ position: "relative" }}>
                <MockDashboard />
                {/* AI response overlay */}
                {aiExpand > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      right: 36,
                      bottom: 80,
                      width: 300,
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid #e0e0e0",
                      borderRadius: 12,
                      padding: "18px 22px",
                      opacity: aiExpand,
                      transform: `translateY(${interpolate(aiExpand, [0, 1], [20, 0])}px)`,
                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13,
                      color: "#444444",
                      lineHeight: 1.6,
                    }}
                  >
                    <div style={{ fontWeight: 600, color: "#111111", marginBottom: 8, fontSize: 14 }}>AI Insight</div>
                    Community engagement up 23% in Zone 4. Resource allocation suggests expanding sensor grid.
                  </div>
                )}
                <AnimatedCursor points={cursorPoints} startDelay={0} />
              </div>
            </BrowserFrame>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
