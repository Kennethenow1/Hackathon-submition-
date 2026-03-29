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
import { BrowserFrame } from "../BrowserFrame";
import { COLORS } from "./constants";
import {
  GradientMeshBg,
  Particles,
  GlassPanel,
  MetricCounter,
  OrbitRing,
} from "./helpers";
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from "../cursorTipOffset";

const { fontFamily } = loadInter();

const tabs = ["FRI", "SAT", "SUN"];
const scheduleRows = [
  { time: "5:00 PM", event: "Opening Ceremony", type: "highlight" },
  { time: "6:00 PM", event: "MLH Workshop", type: "workshop" },
  { time: "7:00 PM", event: "Dinner", type: "food" },
  { time: "8:00 PM", event: "Hacking Begins!", type: "hacking" },
  { time: "10:00 PM", event: "Late Night Snacks", type: "food" },
];

const rowColors: Record<string, string> = {
  highlight: "rgba(212,168,83,0.12)",
  workshop: "rgba(100,150,255,0.08)",
  food: "rgba(34,197,94,0.08)",
  hacking: "rgba(212,168,83,0.15)",
};

export const Scene4Schedule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Active tab
  type TabName = "FRI" | "SAT" | "SUN";
  const activeTab: TabName = frame < 62 ? "FRI" : frame < 104 ? "SAT" : "SUN";

  // Row highlight
  const rowIdx = Math.floor(
    interpolate(frame, [60, 130], [0, 4.9], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  // Live strip
  const liveReveal = interpolate(frame, [160, 212], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Camera pan
  const camY = interpolate(frame, [120, 260], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const scale = interpolate(frame, [0, 18], [0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Cursor for tab switching
  const tabPositions = [
    { x: 350, y: 48 },
    { x: 450, y: 48 },
    { x: 550, y: 48 },
  ];
  const cursorKeyframes = [
    { ...tabPositions[0], frame: 42 },
    { ...tabPositions[1], frame: 62, click: true },
    { ...tabPositions[1], frame: 86 },
    { ...tabPositions[2], frame: 104, click: true },
    { ...tabPositions[2], frame: 120 },
  ];

  let cx = cursorKeyframes[0].x;
  let cy = cursorKeyframes[0].y;
  let isClick = false;
  for (let i = 0; i < cursorKeyframes.length - 1; i++) {
    const a = cursorKeyframes[i];
    const b = cursorKeyframes[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = interpolate(frame, [a.frame, b.frame], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      });
      cx = interpolate(t, [0, 1], [a.x, b.x]);
      cy = interpolate(t, [0, 1], [a.y, b.y]);
      break;
    } else if (frame > b.frame) {
      cx = b.x;
      cy = b.y;
    }
  }
  const cpoint = cursorKeyframes.find(
    (p) => (p as any).click && Math.abs(frame - p.frame) < 4
  );
  if (cpoint) isClick = true;
  const cursorVis = frame >= 42 && frame <= 120;
  const tip = arrowTipOffsetPx(24);

  // Exit
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
      <GradientMeshBg goldIntensity={0.25} greenIntensity={0.2} />
      <Particles count={14} />

      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${scale}) translateY(${camY}px)`,
        }}
      >
        <BrowserFrame url="hackindy.io/schedule" width={1000} shadow>
          <div
            style={{
              background: COLORS.bgPrimary,
              padding: "24px 16px",
              minHeight: 500,
              position: "relative",
            }}
          >
            {/* Section header */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 24,
              }}
            >
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
                RACE WEEKEND
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                }}
              >
                Schedule
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              {tabs.map((tab) => {
                const isActive = tab === activeTab;
                return (
                  <div
                    key={tab}
                    style={{
                      padding: "8px 24px",
                      borderRadius: 8,
                      background: isActive
                        ? COLORS.goldBg10
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? COLORS.borderGold : "rgba(255,255,255,0.06)"}`,
                      color: isActive
                        ? COLORS.racingGold
                        : COLORS.textSecondary,
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "monospace",
                    }}
                  >
                    {tab}
                  </div>
                );
              })}
            </div>

            {/* Schedule rows */}
            <div
              style={{
                border: `1px solid rgba(255,255,255,0.06)`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {scheduleRows.map((row, i) => {
                const isHighlighted = i === rowIdx;
                return (
                  <div
                    key={row.event}
                    style={{
                      display: "flex",
                      padding: "12px 18px",
                      background: isHighlighted
                        ? rowColors[row.type] ?? "transparent"
                        : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span
                      style={{
                        width: 100,
                        color: COLORS.textMuted,
                        fontSize: 13,
                        fontFamily: "monospace",
                      }}
                    >
                      {row.time}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isHighlighted
                          ? COLORS.textPrimary
                          : COLORS.textSecondary,
                      }}
                    >
                      {row.event}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Live strip */}
            <div
              style={{
                marginTop: 20,
                padding: "14px 18px",
                borderRadius: 12,
                background: COLORS.bgSecondary,
                border: `1px solid ${COLORS.greenLiveAlpha}`,
                opacity: liveReveal,
                transform: `translateY(${interpolate(liveReveal, [0, 1], [20, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: COLORS.greenLive,
                  boxShadow: `0 0 8px ${COLORS.greenLive}`,
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.greenLive,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "monospace",
                }}
              >
                GOING ON RIGHT NOW
              </span>
              <span
                style={{
                  color: COLORS.textPrimary,
                  fontSize: 14,
                  fontWeight: 600,
                  marginLeft: 8,
                }}
              >
                Lunch
              </span>
            </div>

            {/* Cursor */}
            {cursorVis && (
              <div
                style={{
                  position: "absolute",
                  left: cx - tip.dx,
                  top: cy - tip.dy,
                  width: 24,
                  height: 24,
                  pointerEvents: "none",
                  zIndex: 999,
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d={CURSOR_ARROW_PATH_D}
                    fill="white"
                    stroke="black"
                    strokeWidth="1.5"
                  />
                </svg>
                {isClick && (
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      left: -8,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: `2px solid ${COLORS.racingGold}80`,
                      background: `${COLORS.racingGold}20`,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </BrowserFrame>
      </AbsoluteFill>

      {/* Glass callout */}
      <div
        style={{
          position: "absolute",
          top: 80,
          right: 80,
          opacity: interpolate(
            spring({
              frame: frame - 118,
              fps,
              config: { damping: 200 },
            }),
            [0, 1],
            [0, 1]
          ),
        }}
      >
        <GlassPanel>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <MetricCounter value={3} delay={176} fontSize={36} />
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                }}
              >
                Days
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <MetricCounter value={48} suffix="+" delay={190} fontSize={36} />
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                }}
              >
                Hours
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Orbit ring around live status */}
      {liveReveal > 0.5 && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <OrbitRing size={200} speed={0.4} color="rgba(34,197,94,0.15)" />
        </div>
      )}
    </AbsoluteFill>
  );
};
