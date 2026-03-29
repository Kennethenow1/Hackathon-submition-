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

const kosmoStats = ["1M+ Articles", "20+ Outlets", "GCP", "K8s"];
const trackerFeatures = ["Metronome Pacing", "3D Path Viewer", "Offline-first"];
const trackerBadges = ["Offline", "PDR + GPS", "Any phone"];

export const Scene7Products: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Kosmopulse entrance
  const kosmoSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 65 },
  });
  const kosmoScale = interpolate(kosmoSpring, [0, 1], [0.8, 1]);

  // Stats stagger
  const statEntries = kosmoStats.map((_, i) =>
    spring({ frame: frame - 20 - i * 4, fps, config: { damping: 200 } })
  );

  // Camera pan right
  const panX = interpolate(frame, [70, 102], [0, -200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Omni Tracker entrance
  const trackerSpring = spring({
    frame: frame - 86,
    fps,
    config: { damping: 16, stiffness: 60 },
  });
  const trackerY = interpolate(trackerSpring, [0, 1], [80, 0]);

  // Phone screenshot flip
  const screenshots = ["Sensor Check", "Metronome", "Survey Plot", "Data Capture"];
  const activeScreenshot = Math.floor(interpolate(frame, [120, 170], [0, 3.99], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));

  // Exit
  const exitOp = interpolate(frame, [170, 210], [1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#111111" }}>
      <GradientMeshBg
        colors={["#111111", "#333333", "#888888", "#ffffff"]}
        baseColor="#0a0a0e"
      />
      <Particles count={8} color="rgba(255,255,255,0.15)" maxSize={2} speed={0.1} seed={111} />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: exitOp,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 60,
            transform: `translateX(${panX}px)`,
            alignItems: "flex-start",
          }}
        >
          {/* Kosmopulse */}
          <div
            style={{
              width: 520,
              background: "#ffffff",
              borderRadius: 16,
              padding: "36px 40px",
              opacity: kosmoSpring,
              transform: `scale(${kosmoScale})`,
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            }}
          >
            <div
              style={{
                fontFamily: spaceGroteskFamily,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase" as const,
                color: "#999999",
                marginBottom: 12,
              }}
            >
              Kosmopulse
            </div>
            <div
              style={{
                fontFamily: outfitFamily,
                fontSize: 28,
                fontWeight: 600,
                color: "#111111",
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            >
              Global Media Intelligence
            </div>
            <div
              style={{
                fontFamily: spaceGroteskFamily,
                fontSize: 15,
                color: "#777777",
                lineHeight: 1.65,
                marginBottom: 24,
              }}
            >
              Geospatial search engine mapping global media narratives across time and location.
            </div>

            {/* Globe mini + arcs */}
            <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 24px" }}>
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #e0e0e0, #999999)",
                  margin: "20px auto 0",
                }}
              />
              {[0, 1].map((a) => (
                <div
                  key={a}
                  style={{
                    position: "absolute",
                    top: 30 + a * 20,
                    left: 20 + a * 30,
                    width: 100 - a * 20,
                    height: 40,
                    border: "1px solid rgba(17,17,17,0.15)",
                    borderRadius: "50%",
                    transform: `rotate(${-20 + a * 40 + frame * 0.3}deg)`,
                  }}
                />
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
              {kosmoStats.map((stat, i) => {
                const s = statEntries[i] ?? 0;
                return (
                  <div
                    key={stat}
                    style={{
                      padding: "6px 14px",
                      background: "#111111",
                      borderRadius: 4,
                      fontFamily: spaceGroteskFamily,
                      fontSize: 12,
                      color: "#ffffff",
                      fontWeight: 500,
                      opacity: s,
                      transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
                    }}
                  >
                    {stat}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Omni Tracker */}
          <div
            style={{
              width: 520,
              opacity: trackerSpring,
              transform: `translateY(${trackerY}px)`,
            }}
          >
            <div
              style={{
                background: "#ffffff",
                borderRadius: 16,
                padding: "36px 40px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  fontFamily: spaceGroteskFamily,
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase" as const,
                  color: "#999999",
                  marginBottom: 12,
                }}
              >
                Omni Tracker
              </div>
              <div
                style={{
                  fontFamily: outfitFamily,
                  fontSize: 28,
                  fontWeight: 600,
                  color: "#111111",
                  marginBottom: 8,
                }}
              >
                1–8% area accuracy
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {trackerBadges.map((b) => (
                  <div
                    key={b}
                    style={{
                      padding: "5px 12px",
                      border: "1px solid #e8e8e8",
                      borderRadius: 6,
                      fontFamily: spaceGroteskFamily,
                      fontSize: 12,
                      color: "#666666",
                    }}
                  >
                    {b}
                  </div>
                ))}
              </div>

              {/* Phone mockup */}
              <div
                style={{
                  width: 200,
                  height: 340,
                  background: "#1a1a1a",
                  borderRadius: 24,
                  margin: "0 auto",
                  padding: 12,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#ffffff",
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 16,
                  }}
                >
                  <div style={{ fontFamily: outfitFamily, fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 8 }}>
                    {screenshots[Math.min(activeScreenshot, 3)]}
                  </div>
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: "radial-gradient(circle, #e0e0e0, #cccccc)",
                    }}
                  />
                </div>
                {/* Pulse ring */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 120 + Math.sin(frame * 0.08) * 20,
                    height: 120 + Math.sin(frame * 0.08) * 20,
                    borderRadius: "50%",
                    border: `1px solid rgba(17,17,17,${0.1 + Math.sin(frame * 0.08) * 0.05})`,
                    pointerEvents: "none" as const,
                  }}
                />
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 20, justifyContent: "center" }}>
                {trackerFeatures.map((f) => (
                  <div
                    key={f}
                    style={{
                      padding: "5px 12px",
                      background: "#f5f5f5",
                      borderRadius: 6,
                      fontFamily: spaceGroteskFamily,
                      fontSize: 12,
                      color: "#444444",
                    }}
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
