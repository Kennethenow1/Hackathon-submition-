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
import { outfitFamily, spaceGroteskFamily } from "./fonts";

const proofCards = [
  {
    type: "deployment",
    title: "SpringBoard Events",
    stats: ["200+ Bands", "Live Community engagement"],
  },
  {
    type: "stat",
    title: "1–8%",
    subtitle: "Area Accuracy",
    stats: ["200+ Community members", "Global Geographic reach"],
  },
  {
    type: "news",
    title: "PATNuC",
    tag: "NEWS",
    excerpt: "$100M World Bank digital transformation initiative driving impact across communities.",
  },
];

export const Scene8Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera push
  const cameraPush = interpolate(frame, [90, 150], [1.0, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Text highlight sweep on PATNuC
  const highlightX = interpolate(frame, [50, 110], [-100, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Exit
  const exitOp = interpolate(frame, [150, 180], [1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <GradientMeshBg
        colors={["#111111", "#666666", "#999999", "#ffffff"]}
        baseColor="#0e0e12"
      />
      <Particles count={18} color="rgba(255,255,255,0.2)" maxSize={2} speed={0.12} seed={123} />
      <LensFlare x={50} y={50} size={500} color="#888888" />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: "0 100px",
          opacity: exitOp,
          transform: `scale(${cameraPush})`,
        }}
      >
        {proofCards.map((card, i) => {
          const s = spring({
            frame: frame - i * 10,
            fps,
            config: { damping: 18, stiffness: 70 },
          });
          const hoverFloat = Math.sin((frame + i * 25) * 0.03) * 4;
          const isFocal = i === 1;

          return (
            <div
              key={i}
              style={{
                width: isFocal ? 380 : 340,
                background: "#ffffff",
                borderRadius: 12,
                padding: "32px 28px",
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [40, hoverFloat])}px) scale(${isFocal ? interpolate(frame, [20, 70], [1, 1.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1})`,
                boxShadow: isFocal ? "0 20px 50px rgba(0,0,0,0.18)" : "0 10px 30px rgba(0,0,0,0.1)",
                overflow: "hidden",
                position: "relative" as const,
              }}
            >
              {card.tag && (
                <div
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    background: "#111111",
                    borderRadius: 3,
                    fontFamily: spaceGroteskFamily,
                    fontSize: 10,
                    color: "#ffffff",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    marginBottom: 12,
                  }}
                >
                  {card.tag}
                </div>
              )}
              <div
                style={{
                  fontFamily: outfitFamily,
                  fontSize: card.type === "stat" ? 48 : 22,
                  fontWeight: 600,
                  color: "#111111",
                  marginBottom: card.subtitle ? 4 : 10,
                }}
              >
                {card.title}
              </div>
              {card.subtitle && (
                <div
                  style={{
                    fontFamily: spaceGroteskFamily,
                    fontSize: 16,
                    color: "#888888",
                    marginBottom: 16,
                  }}
                >
                  {card.subtitle}
                </div>
              )}
              {card.excerpt && (
                <div
                  style={{
                    fontFamily: spaceGroteskFamily,
                    fontSize: 14,
                    color: "#777777",
                    lineHeight: 1.65,
                    position: "relative" as const,
                    overflow: "hidden" as const,
                  }}
                >
                  {card.excerpt}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${highlightX}%`,
                      width: 60,
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(17,17,17,0.06), transparent)",
                      pointerEvents: "none" as const,
                    }}
                  />
                </div>
              )}
              {card.stats && (
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, marginTop: 10 }}>
                  {(card.stats ?? []).map((stat) => (
                    <div
                      key={stat}
                      style={{
                        fontFamily: spaceGroteskFamily,
                        fontSize: 13,
                        color: "#666666",
                        padding: "4px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      {stat}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
