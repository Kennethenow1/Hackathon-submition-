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
import { outfitFamily, spaceGroteskFamily } from "./fonts";

const rows = [
  {
    num: "01",
    problem: "Resource Mapping",
    problemDesc: "Fragmented field data with no unified geospatial view.",
    solution: "Unified GIS globe with real-time resource mapping.",
  },
  {
    num: "02",
    problem: "Community Interaction",
    problemDesc: "Siloed teams and disconnected community channels.",
    solution: "Integrated posting, messaging, and affiliate networks.",
  },
  {
    num: "03",
    problem: "Actionable Insights",
    problemDesc: "Raw data with no trend analysis or AI-driven metrics.",
    solution: "Live dashboards, trend analysis, and AI-driven community health metrics.",
  },
];

export const Scene2Challenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BG blur sharpen
  const bgBlur = interpolate(frame, [0, 18], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bgOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Header
  const headerY = interpolate(frame, [8, 34], [36, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const headerOp = interpolate(frame, [8, 34], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Solution light sweep
  const sweepX = interpolate(frame, [106, 156], [-100, 110], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Exit
  const exitScale = interpolate(frame, [150, 180], [1, 0.97], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOp = interpolate(frame, [150, 180], [1, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: bgOpacity,
          filter: `blur(${bgBlur}px)`,
        }}
      >
        <GradientMeshBg
          colors={["#111111", "#444444", "#999999", "#222222"]}
          baseColor="#0c0c0f"
        />
      </div>
      <Particles count={10} color="rgba(255,255,255,0.2)" maxSize={2} speed={0.15} seed={33} />

      <AbsoluteFill
        style={{
          padding: "80px 140px",
          opacity: exitOp,
          transform: `scale(${exitScale})`,
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: headerOp,
            transform: `translateY(${headerY}px)`,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: spaceGroteskFamily,
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "#999999",
              marginBottom: 14,
            }}
          >
            The Challenge
          </div>
          <div
            style={{
              fontFamily: outfitFamily,
              fontSize: 48,
              fontWeight: 300,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            We Build for the hardest problems in the field.
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            borderTop: "1.5px solid rgba(255,255,255,0.2)",
            marginTop: 30,
          }}
        >
          {/* Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 1fr",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              padding: "14px 0",
            }}
          >
            <div />
            <div
              style={{
                fontFamily: spaceGroteskFamily,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                color: "#999999",
              }}
            >
              Challenge
            </div>
            <div
              style={{
                fontFamily: spaceGroteskFamily,
                fontSize: 11,
                letterSpacing: "0.15em",
                textTransform: "uppercase" as const,
                color: "#999999",
              }}
            >
              Solution
            </div>
          </div>

          {rows.map((row, i) => {
            const delay = 26 + i * 10;
            const rowSpring = spring({
              frame: frame - delay,
              fps,
              config: { damping: 20, stiffness: 80 },
            });
            const numX = interpolate(rowSpring, [0, 1], [-20, 0]);
            const cardY = interpolate(rowSpring, [0, 1], [48, 0]);
            const challengeOp = interpolate(frame, [60, 130], [0.65, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const solutionOp = interpolate(frame, [60, 130], [0.35, 0.65], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1fr",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  padding: "24px 0",
                  opacity: rowSpring,
                }}
              >
                <div
                  style={{
                    fontFamily: spaceGroteskFamily,
                    fontSize: 14,
                    color: "#666666",
                    transform: `translateX(${numX}px)`,
                  }}
                >
                  {row.num}
                </div>
                <div
                  style={{
                    transform: `translateY(${cardY * 0.5}px)`,
                    opacity: challengeOp,
                  }}
                >
                  <div
                    style={{
                      fontFamily: outfitFamily,
                      fontSize: 22,
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: 6,
                    }}
                  >
                    {row.problem}
                  </div>
                  <div
                    style={{
                      fontFamily: spaceGroteskFamily,
                      fontSize: 16,
                      lineHeight: 1.65,
                      color: "#888888",
                    }}
                  >
                    {row.problemDesc}
                  </div>
                </div>
                <div
                  style={{
                    position: "relative",
                    transform: `translateY(${cardY * 0.5}px)`,
                    opacity: solutionOp,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: `${sweepX}%`,
                      width: 80,
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
                      pointerEvents: "none" as const,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: spaceGroteskFamily,
                      fontSize: 16,
                      lineHeight: 1.65,
                      color: "#bbbbbb",
                    }}
                  >
                    {row.solution}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
