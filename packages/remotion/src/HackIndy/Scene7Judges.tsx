import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { COLORS } from "./constants";
import {
  GradientMeshBg,
  Particles,
  GlassPanel,
  MetricCounter,
} from "./helpers";

const { fontFamily } = loadInter();

const judges = [
  { num: "01", name: "Mike Hockerman", company: "Apple" },
  { num: "02", name: "Jim Ulbright", company: "Amazon Web Services" },
  { num: "03", name: "Manideep Reddy Gillela", company: "Trava Security" },
  { num: "04", name: "Lyna Nguyen", company: "Crowe" },
];

const sponsors = [
  "Purdue CS",
  "RCAC",
  "The Data Mine",
  "Indy Hackers",
  "Jane Street",
  "G-Research",
  "North Mass",
  "SIG",
  "Kusari",
  "Anu",
  "Amway",
  "Realync",
  "Farm Bureau",
  "Crowe",
  "Trava Sec",
  "GitHub",
  "Featherless AI",
];

export const Scene7Judges: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Phase: 0-126 judges, 126-300 sponsors
  const showSponsors = frame >= 90;

  // Camera
  const panX = interpolate(frame, [90, 126], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const camScale = interpolate(frame, [28, 90, 126], [1, 1.04, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitO = interpolate(
    frame,
    [durationInFrames - 36, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{ background: COLORS.bgPrimary, fontFamily, opacity: exitO }}
    >
      <GradientMeshBg goldIntensity={0.35} greenIntensity={0.05} />
      <Particles count={16} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          transform: `scale(${camScale}) translateX(${panX}px)`,
        }}
      >
        {/* Judges */}
        {!showSponsors && (
          <>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: COLORS.racingGold,
                fontFamily: "monospace",
                marginBottom: 6,
              }}
            >
              JUDGES
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginTop: 20,
              }}
            >
              {judges.map((j, i) => {
                const s = spring({
                  frame: frame - i * 6,
                  fps,
                  config: { damping: 18, stiffness: 90 },
                });
                const y = interpolate(s, [0, 1], [50, 0]);
                return (
                  <div
                    key={j.num}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      borderRadius: 12,
                      background: "rgba(17,17,22,0.8)",
                      border: `1px solid ${COLORS.borderGold}`,
                      transform: `translateY(${y}px)`,
                      opacity: s,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: COLORS.goldBg10,
                        border: `1px solid ${COLORS.borderGold}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: COLORS.racingGold,
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    >
                      {j.num}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: COLORS.textPrimary,
                        }}
                      >
                        {j.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: COLORS.racingGold,
                        }}
                      >
                        {j.company}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Sponsors */}
        {showSponsors && (
          <>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: COLORS.racingGold,
                fontFamily: "monospace",
                marginBottom: 6,
              }}
            >
              SPONSORS GARAGE
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 10,
                marginTop: 20,
              }}
            >
              {sponsors.map((sp, i) => {
                const delay = 122 - 90 + i * 3;
                const sps = spring({
                  frame: frame - 90 - delay,
                  fps,
                  config: { damping: 20, stiffness: 80 },
                });
                const hover =
                  Math.sin(frame * 0.02 + i * 0.5) * (i % 2 === 0 ? 2 : -2);
                return (
                  <div
                    key={sp}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: COLORS.textSecondary,
                      fontSize: 11,
                      fontWeight: 600,
                      textAlign: "center",
                      opacity: sps,
                      transform: `translateY(${hover}px) scale(${interpolate(
                        sps,
                        [0, 1],
                        [0.85, 1]
                      )})`,
                    }}
                  >
                    {sp}
                  </div>
                );
              })}
            </div>

            {/* Metric */}
            <div
              style={{
                marginTop: 24,
                opacity: interpolate(
                  spring({
                    frame: frame - 170,
                    fps,
                    config: { damping: 200 },
                  }),
                  [0, 1],
                  [0, 1]
                ),
              }}
            >
              <GlassPanel>
                <MetricCounter
                  value={200}
                  suffix="+ Hackers"
                  delay={170}
                  fontSize={32}
                />
              </GlassPanel>
            </div>
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
