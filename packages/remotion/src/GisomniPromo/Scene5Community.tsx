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
import { AnimatedCursor } from "./AnimatedCursor";
import { outfitFamily, spaceGroteskFamily } from "./fonts";

const featureCards = ["Posting", "Direct Messaging", "Affiliate Posting"];

const feedItems = [
  { user: "Field Agent A", msg: "Deployed sensor grid in Zone 4", time: "2m ago" },
  { user: "Community Hub", msg: "New affiliate request from Region 7", time: "5m ago" },
  { user: "Analyst B", msg: "Resource mapping update complete", time: "12m ago" },
];

export const Scene5Community: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Feed entrance
  const feedEntries = feedItems.map((_, i) => {
    return spring({
      frame: frame - i * 8,
      fps,
      config: { damping: 18, stiffness: 80 },
    });
  });

  // Right cards
  const cardEntries = featureCards.map((_, i) => {
    return spring({
      frame: frame - 14 - i * 8,
      fps,
      config: { damping: 16, stiffness: 75 },
    });
  });

  // Message expand after click
  const expandProgress = interpolate(frame, [108, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Parallax
  const leftDrift = Math.sin(frame * 0.025) * 6;
  const rightDrift = Math.sin(frame * 0.025 + 1) * -4;

  // Cursor
  const cursorPoints = [
    { x: 300, y: 250, frame: 20 },
    { x: 750, y: 370, frame: 60 },
    { x: 750, y: 370, frame: 108, click: true },
    { x: 760, y: 365, frame: 130 },
  ];

  // Exit
  const exitOp = interpolate(frame, [216, 240], [1, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitX = interpolate(frame, [216, 240], [0, -30], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <GradientMeshBg
        colors={["#111111", "#666666", "#999999", "#ffffff"]}
        baseColor="#0c0c10"
      />
      <Particles count={16} color="rgba(255,255,255,0.18)" maxSize={2} speed={0.15} seed={88} />

      <AbsoluteFill
        style={{
          display: "flex",
          padding: "80px 100px",
          gap: 60,
          opacity: exitOp,
          transform: `translateX(${exitX}px)`,
        }}
      >
        {/* Left: Feed */}
        <div
          style={{
            flex: "0 0 55%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            transform: `translateY(${leftDrift}px)`,
          }}
        >
          <div
            style={{
              fontFamily: spaceGroteskFamily,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "#999999",
              marginBottom: 10,
            }}
          >
            Community Feed
          </div>
          {feedItems.map((item, i) => {
            const s = feedEntries[i] ?? 0;
            const rotate = interpolate(s, [0, 1], [2, 0]);
            return (
              <div
                key={i}
                style={{
                  background: "#ffffff",
                  border: "1px solid #e8e8e8",
                  borderRadius: 12,
                  padding: "20px 24px",
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) rotate(${rotate}deg)`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontFamily: outfitFamily, fontSize: 15, fontWeight: 600, color: "#111111" }}>
                    {item.user}
                  </div>
                  <div style={{ fontFamily: spaceGroteskFamily, fontSize: 12, color: "#aaaaaa" }}>
                    {item.time}
                  </div>
                </div>
                <div style={{ fontFamily: spaceGroteskFamily, fontSize: 14, color: "#777777", lineHeight: 1.5 }}>
                  {item.msg}
                </div>
                {/* Message expand */}
                {i === 1 && expandProgress > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "12px 16px",
                      background: "#f5f5f5",
                      borderRadius: 8,
                      opacity: expandProgress,
                      maxHeight: expandProgress * 80,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ fontFamily: spaceGroteskFamily, fontSize: 13, color: "#666666" }}>
                      ✓ Message thread opened — 3 responses from field team
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Feature cards */}
        <div
          style={{
            flex: "0 0 40%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingTop: 40,
            transform: `translateY(${rightDrift}px)`,
          }}
        >
          <div
            style={{
              fontFamily: spaceGroteskFamily,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "#999999",
              marginBottom: 10,
            }}
          >
            Omni Net · Community
          </div>
          {featureCards.map((card, i) => {
            const s = cardEntries[i] ?? 0;
            const isMain = i === 1;
            const hoverFloat = Math.sin((frame + i * 30) * 0.03) * 3;
            return (
              <div
                key={card}
                style={{
                  background: "#ffffff",
                  border: isMain ? "2px solid #111111" : "1px solid #e8e8e8",
                  borderRadius: 12,
                  padding: "22px 28px",
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [30, hoverFloat])}px) scale(${isMain ? 1.02 : 1})`,
                  boxShadow: isMain ? "0 12px 30px rgba(0,0,0,0.12)" : "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontFamily: outfitFamily, fontSize: 20, fontWeight: 600, color: "#111111", marginBottom: 4 }}>
                  {card}
                </div>
                <div style={{ fontFamily: spaceGroteskFamily, fontSize: 14, color: "#777777" }}>
                  {i === 0 && "Share updates across affiliated teams in real time."}
                  {i === 1 && "Secure, direct messaging for field coordination."}
                  {i === 2 && "Cross-network posting with affiliate partnerships."}
                </div>
              </div>
            );
          })}

          {/* Pulse rings behind main card */}
          {[0, 1, 2].map((r) => {
            const pulseOp = interpolate(
              Math.sin(frame * 0.06 + r * 2),
              [-1, 1],
              [0.05, 0.15]
            );
            return (
              <div
                key={r}
                style={{
                  position: "absolute",
                  right: 60 - r * 20,
                  top: 200 - r * 20,
                  width: 200 + r * 40,
                  height: 200 + r * 40,
                  borderRadius: "50%",
                  border: `1px solid rgba(255,255,255,${pulseOp})`,
                  pointerEvents: "none" as const,
                }}
              />
            );
          })}
        </div>

        <AnimatedCursor points={cursorPoints} startDelay={0} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
