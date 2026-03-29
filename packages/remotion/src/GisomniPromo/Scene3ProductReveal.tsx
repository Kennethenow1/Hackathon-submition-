import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { FloatingBrowser } from "../BrowserFrame";
import { MockSitePage } from "./MockSitePage";
import { GradientMeshBg } from "./GradientMeshBg";
import { Particles } from "./Particles";
import { LensFlare } from "./LensFlare";
import { AnimatedCursor } from "./AnimatedCursor";

const SCENE_DURATION = 180;

export const Scene3ProductReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser entrance
  const browserSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 60, mass: 1.2 },
  });
  const browserY = interpolate(browserSpring, [0, 1], [120, 0]);
  const browserScale = interpolate(browserSpring, [0, 1], [0.74, 0.84]);
  const browserOp = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Camera push
  const cameraScale = interpolate(frame, [114, 172], [0.84, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const rotateYRelax = interpolate(frame, [114, 172], [12, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const microDrift = Math.sin(frame * 0.03) * 3;

  // "View Features" button approximate center in MockSitePage coordinates
  // The button is at roughly x=660, y=540 in the 1200x720 MockSitePage
  const btnX = 660;
  const btnY = 540;

  const cursorPoints = [
    { x: 200, y: 650, frame: 0 },
    { x: btnX, y: btnY, frame: 68 },
    { x: btnX, y: btnY, frame: 110, click: true },
    { x: btnX + 10, y: btnY - 5, frame: 140 },
  ];

  // Exit
  const exitOp = interpolate(frame, [156, 180], [1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <GradientMeshBg
        colors={["#111111", "#666666", "#999999", "#ffffff"]}
        baseColor="#0d0d12"
      />
      <Particles count={14} color="rgba(255,255,255,0.25)" maxSize={2} speed={0.18} seed={55} />
      <LensFlare x={20} y={25} size={300} color="#888888" />
      <LensFlare x={80} y={70} size={200} color="#666666" />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: browserOp * exitOp,
        }}
      >
        <div
          style={{
            perspective: 1200,
            transform: `translateY(${browserY + microDrift}px)`,
          }}
        >
          <div
            style={{
              transform: `scale(${Math.max(browserScale, cameraScale)}) rotateX(-8deg) rotateY(${rotateYRelax}deg)`,
              transformStyle: "preserve-3d" as const,
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.45)",
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                width: 1200,
                background: "#1a1a1a",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Browser chrome */}
              <div
                style={{
                  height: 36,
                  background: "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  gap: 8,
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
                <div
                  style={{
                    flex: 1,
                    marginLeft: 16,
                    height: 22,
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.45)",
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  gisomni.com
                </div>
              </div>
              {/* Page content - relative for cursor positioning */}
              <div style={{ position: "relative" }}>
                <MockSitePage />
                <AnimatedCursor points={cursorPoints} startDelay={42} />
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
