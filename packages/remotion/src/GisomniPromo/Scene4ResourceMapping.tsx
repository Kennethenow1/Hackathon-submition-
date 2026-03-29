import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { GradientMeshBg } from "./GradientMeshBg";
import { Particles } from "./Particles";
import { LensFlare } from "./LensFlare";
import { GlassCard } from "./GlassCard";
import { AnimatedCursor } from "./AnimatedCursor";
import { outfitFamily, spaceGroteskFamily } from "./fonts";

const chips = ["GIS Globe", "Resource Mapping", "Network Visualisation"];

export const Scene4ResourceMapping: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Zoom into solution cell
  const zoomScale = interpolate(frame, [0, 26], [1.0, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Glass panel entrance
  const panelSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 16, stiffness: 70 },
  });
  const panelX = interpolate(panelSpring, [0, 1], [80, 0]);
  const panelOp = panelSpring;

  // Chips stagger
  const chipEntries = chips.map((_, i) => {
    const s = spring({
      frame: frame - 36 - i * 5,
      fps,
      config: { damping: 18, stiffness: 90 },
    });
    return s;
  });

  // Globe mini
  const globeRotation = frame * 0.5;

  // Map pings
  const pingPositions = [
    { x: 28, y: 35 }, { x: 42, y: 55 }, { x: 65, y: 30 },
    { x: 55, y: 50 }, { x: 38, y: 42 }, { x: 72, y: 58 },
  ];

  // Camera arc
  const arcX = interpolate(frame, [170, 216], [0, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Exit
  const exitOp = interpolate(frame, [216, 240], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor
  const cursorPoints = [
    { x: 900, y: 300, frame: 60 },
    { x: 1080, y: 380, frame: 100 },
    { x: 1080, y: 380, frame: 136, click: true },
    { x: 1100, y: 370, frame: 160 },
  ];

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <GradientMeshBg
        colors={["#111111", "#444444", "#888888", "#ffffff"]}
        baseColor="#0e0e14"
      />
      <Particles count={12} color="rgba(255,255,255,0.2)" maxSize={2} speed={0.12} seed={77} />
      <LensFlare x={15} y={40} size={250} color="#777777" />

      <AbsoluteFill
        style={{
          transform: `scale(${zoomScale}) translateX(${arcX}px)`,
          opacity: exitOp,
        }}
      >
        {/* Left side: zoomed solution cell area */}
        <div
          style={{
            position: "absolute",
            left: 100,
            top: 200,
            width: 600,
            height: 400,
          }}
        >
          {/* Mini globe */}
          <div
            style={{
              position: "absolute",
              left: 60,
              top: 40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1) 0%, rgba(60,60,60,0.5) 50%, #222222 100%)",
              transform: `rotateY(${globeRotation}deg)`,
              boxShadow: "0 0 60px rgba(255,255,255,0.05)",
            }}
          >
            {/* Dashed orbital */}
            <div
              style={{
                position: "absolute",
                inset: -20,
                borderRadius: "50%",
                border: "1px dashed rgba(255,255,255,0.1)",
              }}
            />
          </div>

          {/* Map pings */}
          {pingPositions.map((pos, i) => {
            const pingDelay = 80 + i * 12;
            const pingOp = interpolate(frame, [pingDelay, pingDelay + 20, pingDelay + 60, pingDelay + 80], [0, 0.8, 0.8, 0.3], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pingScale = interpolate(frame, [pingDelay, pingDelay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.7)",
                  boxShadow: "0 0 12px rgba(255,255,255,0.3)",
                  opacity: pingOp,
                  transform: `scale(${pingScale})`,
                }}
              />
            );
          })}

          {/* Focus label */}
          <div
            style={{
              position: "absolute",
              left: 10,
              bottom: 20,
              opacity: interpolate(frame, [4, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            <div
              style={{
                fontFamily: outfitFamily,
                fontSize: 36,
                fontWeight: 600,
                color: "#ffffff",
                marginBottom: 8,
              }}
            >
              Resource Mapping
            </div>
            <div
              style={{
                fontFamily: spaceGroteskFamily,
                fontSize: 16,
                color: "#aaaaaa",
                lineHeight: 1.65,
                maxWidth: 400,
              }}
            >
              Unified GIS globe with real-time resource mapping and network visualisation.
            </div>
          </div>
        </div>

        {/* Right side: Glass callout */}
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 220,
            transform: `translateX(${panelX}px)`,
            opacity: panelOp,
          }}
        >
          <GlassCard width={400}>
            <div
              style={{
                fontFamily: spaceGroteskFamily,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: "#999999",
                marginBottom: 18,
              }}
            >
              Omni Net · Geospatial Stack
            </div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
              {chips.map((chip, i) => {
                const s = chipEntries[i] ?? 0;
                const chipFloat = Math.sin((frame + i * 20) * 0.04) * 3;
                return (
                  <div
                    key={chip}
                    style={{
                      padding: "10px 20px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8,
                      fontFamily: spaceGroteskFamily,
                      fontSize: 14,
                      color: "#ffffff",
                      fontWeight: 500,
                      opacity: s,
                      transform: `translateY(${interpolate(s, [0, 1], [20, chipFloat])}px)`,
                    }}
                  >
                    {chip}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        <AnimatedCursor points={cursorPoints} startDelay={40} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
