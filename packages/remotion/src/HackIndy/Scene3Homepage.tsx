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
import { FloatingBrowser } from "../BrowserFrame";
import { COLORS } from "./constants";
import {
  GradientMeshBg,
  Particles,
  LensFlare,
  GlassPanel,
  MetricCounter,
  RacingBadge,
} from "./helpers";
import { arrowTipOffsetPx, CURSOR_ARROW_PATH_D } from "../cursorTipOffset";

const { fontFamily } = loadInter();

// Recreated mini homepage content
const HeroContent: React.FC<{ scrollY?: number }> = ({
  scrollY = 0,
}) => (
  <div
    style={{
      width: 1200,
      height: 1600,
      background: COLORS.bgPrimary,
      position: "relative",
      overflow: "hidden",
      fontFamily,
      transform: `translateY(${-scrollY}px)`,
    }}
  >
    {/* Nav */}
    <div
      style={{
        height: 50,
        background: "rgba(10,10,13,0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span style={{ color: COLORS.racingGold, fontWeight: 800, fontSize: 18 }}>
        HACK
      </span>
      <span style={{ color: COLORS.textPrimary, fontWeight: 800, fontSize: 18 }}>
        {" "}INDY
      </span>
      <div style={{ flex: 1 }} />
      {["About", "Schedule", "Prizes", "FAQ"].map((item) => (
        <span
          key={item}
          style={{
            color: COLORS.textSecondary,
            fontSize: 12,
            marginLeft: 24,
          }}
        >
          {item}
        </span>
      ))}
    </div>

    {/* Hero */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 650,
        background: `linear-gradient(180deg, transparent 60%, ${COLORS.bgPrimary} 100%)`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 12px",
          border: `1px solid ${COLORS.borderGold}`,
          borderRadius: 6,
          background: COLORS.goldBgFaint,
          marginBottom: 20,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: COLORS.greenLive,
            marginRight: 8,
          }}
        />
        <span
          style={{
            color: COLORS.racingGold,
            fontSize: 11,
            fontFamily: "monospace",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          REGISTRATION OPEN
        </span>
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: COLORS.textPrimary,
          letterSpacing: "0.05em",
        }}
      >
        HACK INDY
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 900,
          color: COLORS.racingGold,
          letterSpacing: "0.1em",
        }}
      >
        2026
      </div>
      <div
        style={{
          marginTop: 24,
          padding: "12px 36px",
          border: `2px solid ${COLORS.racingGold}`,
          borderRadius: 8,
          background: COLORS.goldBgFaint,
          color: COLORS.racingGold,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Register on Devpost
      </div>
    </div>

    {/* About section */}
    <div
      style={{
        margin: "40px 60px",
        padding: 40,
        border: `1px solid ${COLORS.borderGold}`,
        borderRadius: 16,
        background: "rgba(17,17,22,0.8)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: COLORS.racingGold,
          fontFamily: "monospace",
          marginBottom: 12,
        }}
      >
        ABOUT
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.textPrimary,
          marginBottom: 16,
        }}
      >
        Indy’s Biggest Student-Run Hackathon
      </div>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: COLORS.textSecondary,
        }}
      >
        Hack Indy is Purdue Indianapolis’ largest student-run hackathon,
        bringing together 200+ hackers for a full weekend of creativity,
        learning, and innovation. Open to everyone — any school, any major, any
        experience level.
      </p>
    </div>
  </div>
);

export const Scene3Homepage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // In-browser scroll
  const scrollY = interpolate(frame, [88, 156], [0, 380], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Camera push-in
  const zoomScale = interpolate(frame, [150, 240], [0.84, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Stats chips
  const stats = [
    { label: "Hackers", val: 200, suffix: "+" },
    { label: "Days", val: 3, suffix: "" },
    { label: "Hours", val: 48, suffix: "+" },
    { label: "Campus", val: 0, suffix: "" },
  ];

  // Cursor path - move toward Devpost CTA area
  // CTA is approximately at (600, 460) in the browser content
  const cursorPoints = [
    { x: 200, y: 500, frame: 52 },
    { x: 600, y: 460, frame: 72, click: true },
    { x: 600, y: 460, frame: 90 },
  ];

  let cursorX = cursorPoints[0].x;
  let cursorY = cursorPoints[0].y;
  let isClicking = false;

  for (let i = 0; i < cursorPoints.length - 1; i++) {
    const from = cursorPoints[i];
    const to = cursorPoints[i + 1];
    if (frame >= from.frame && frame <= to.frame) {
      const t = interpolate(frame, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      });
      cursorX = interpolate(t, [0, 1], [from.x, to.x]);
      cursorY = interpolate(t, [0, 1], [from.y, to.y]);
      break;
    } else if (frame > to.frame) {
      cursorX = to.x;
      cursorY = to.y;
    }
  }

  const clickPoint = cursorPoints.find(
    (p) => p.click && Math.abs(frame - p.frame) < 4
  );
  if (clickPoint) isClicking = true;

  const cursorVisible = frame >= 52 && frame <= 120;
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
      <GradientMeshBg goldIntensity={0.35} greenIntensity={0.1} />
      <Particles count={20} />
      <LensFlare x={80} y={20} size={300} />
      <LensFlare x={15} y={70} size={200} color={COLORS.racingGold} />

      {/* Browser frame */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FloatingBrowser
          url="hackindy.io"
          rotateX={-8}
          rotateY={10}
          scale={zoomScale}
          enterDelay={0}
          durationInFrames={24}
          width={1200}
        >
          <div style={{ position: "relative", width: 1200, height: 600, overflow: "hidden" }}>
            <HeroContent scrollY={scrollY} />

            {/* Cursor */}
            {cursorVisible && (
              <div
                style={{
                  position: "absolute",
                  left: cursorX - tip.dx,
                  top: cursorY - tip.dy,
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
                {isClicking && (
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      left: -8,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: `2px solid ${COLORS.racingGold}80`,
                      background: `${COLORS.racingGold}20`,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </FloatingBrowser>
      </AbsoluteFill>

      {/* Stats panel */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 80,
          display: "flex",
          gap: 16,
        }}
      >
        {stats.map((st, i) => {
          const s = spring({
            frame: frame - 110 - i * 6,
            fps,
            config: { damping: 20, stiffness: 90 },
          });
          return (
            <GlassPanel
              key={st.label}
              style={{
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                textAlign: "center",
              }}
            >
              {st.val > 0 ? (
                <MetricCounter
                  value={st.val}
                  suffix={st.suffix}
                  delay={110 + i * 6}
                  fontSize={28}
                />
              ) : (
                <span
                  style={{
                    color: COLORS.racingGold,
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  PUI
                </span>
              )}
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: 4,
                }}
              >
                {st.label}
              </div>
            </GlassPanel>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
