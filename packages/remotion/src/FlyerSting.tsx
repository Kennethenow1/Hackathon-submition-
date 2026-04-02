import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Outfit";
import { FloatingBrowser } from "./BrowserFrame";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800"],
  subsets: ["latin"],
});

export const FLYER_STING_DURATION = 60;

// ---------------------------------------------------------------
// Particle field
// ---------------------------------------------------------------
function Particles({ count = 16, frame }: { count?: number; frame: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: 10 + ((i * 63 + 17) % 80),
        y: 10 + ((i * 41 + 29) % 80),
        size: 2 + (i % 4),
        speed: 0.014 + (i % 5) * 0.004,
        phase: i * 0.71,
        opacity: 0.08 + (i % 5) * 0.02,
      })),
    [count]
  );
  return (
    <>
      {particles.map((p, i) => {
        const y = p.y + Math.sin(frame * p.speed + p.phase) * 6;
        const x = p.x + Math.cos(frame * p.speed * 0.8 + p.phase) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: "rgba(120,160,220,0.8)",
              opacity: p.opacity * (0.7 + Math.sin(frame * 0.08 + p.phase) * 0.3),
            }}
          />
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------
// Animated gradient mesh background
// ---------------------------------------------------------------
function GradientMesh({
  frame,
  intensity = 1,
}: {
  frame: number;
  intensity?: number;
}) {
  const x1 = 45 + Math.sin(frame * 0.02) * 12;
  const y1 = 40 + Math.cos(frame * 0.015) * 10;
  const x2 = 65 + Math.cos(frame * 0.018) * 10;
  const y2 = 55 + Math.sin(frame * 0.022) * 8;
  const alpha1 = (0.4 + intensity * 0.15).toFixed(2);
  const alpha2 = (0.28 + intensity * 0.12).toFixed(2);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 60% at ${x1}% ${y1}%, rgba(225,235,248,${alpha1}) 0%, transparent 70%),
          radial-gradient(ellipse 50% 50% at ${x2}% ${y2}%, rgba(210,226,243,${alpha2}) 0%, transparent 60%),
          linear-gradient(160deg, #f7f9fc 0%, #eef3f9 40%, #e5edf7 100%)`,
      }}
    />
  );
}

// ---------------------------------------------------------------
// Counter value helper: returns float for a given global frame
// Curve: 1 @ frame2, 12 @ frame12, 78@ frame 47, 100 @ frame 56
// ---------------------------------------------------------------
function counterValue(frame: number): number {
  if (frame <= 2) return 1;
  if (frame <= 12) {
    return interpolate(frame, [2, 12], [1, 12], {
      easing: Easing.out(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  if (frame <= 47) {
    return interpolate(frame, [12, 47], [12, 78], {
      easing: Easing.inOut(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  // Final sprint and overshoot: 78@ 47 -> 102@ 54 -> 100@ 56
  if (frame <= 54) {
    return interpolate(frame, [47, 54], [78, 102], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }
  // overshoot settle
  return interpolate(frame, [54, 58], [102, 100], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// ---------------------------------------------------------------
// Flyer app UI (recreated) for FloatingBrowser
// ---------------------------------------------------------------
function FlyerAppUI({ localFrame }: { localFrame: number }) {
  const { fps } = useVideoConfig();

  const titleEnter = spring({
    frame: localFrame - 4,
    fps,
    config: { damping: 40, stiffness: 160 },
  });
  const scanTitleEnter = spring({
    frame: localFrame - 6,
    fps,
    config: { damping: 42, stiffness: 150 },
  });
  const subtitleEnter = spring({
    frame: localFrame - 10,
    fps,
    config: { damping: 45, stiffness: 130 },
  });
  const uploadEnter = spring({
    frame: localFrame - 13,
    fps,
    config: { damping: 45, stiffness: 120 },
  });
  const btnEnter = spring({
    frame: localFrame - 16,
    fps,
    config: { damping: 45, stiffness: 120 },
  });

  return (
    <div
      style={{
        background: "#f7f9fc",
        minHeight: 560,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "32px 16px 24px ",
        fontFamily,
      }}
    >
      {/* brand header */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          opacity: titleEnter,
          transform: `translateY(${interpolate(titleEnter, [0, 1], [-16, 0])}px)`,
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#1a1a2e",
          }}
        >
          Flyer
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#e2eaf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
          }}
        >
          <span style={{ color: "#667ea6" }}>🜊</span>
        </div>
      </div>

      {/* main card */}
      <div
        style={{
          width: "100%",
          background: "#ffffff",
          borderRadius: 16,
          boyShadow: "0 4px 24px rgba(0,0,0,0.07)",
          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            opacity: scanTitleEnter,
            transform: `translateY(${interpolate(scanTitleEnter, [0, 1], [-16, 0])}px)`,
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              color: "#1a1a2e",
              letterSpacing: "-0.3px",
            }}
          >
            Scan Your Flyer
          </h2>
        </div>
        <div
          style={{
            opacity: subtitleEnter,
            transform: `translateY(${interpolate(subtitleEnter, [0, 1], [12, 0])}px)`,
            marginBottom: 24,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: "#667ea6", fontWeight: 400 }}>
            Extract event details instantly with AI
          </p>
        </div>

        {/* upload section */}
        <div
          style={{
            opacity: uploadEnter,
            transform: `translateY(${interpolate(uploadEnter, [0, 1], [16, 0])}px)`,
          }}
        >
          <div
            style={{
              border: "1.5px dashed #c4d1df",
              borderRadius: 12,
              padding: "28px 16px",
              textAlign: "center",
              marginBottom: 16,
              background: "#f7f9fc",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1a1a2e",
                marginBottom: 4,
              }}
            >
              Drop your image or PDF here
            </div>
            <div style={{ fontSize: 11, color: "#99adc2" }}>
              Supports PNG, JPG, PDF
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#e2eaf4" }} />
            <span style={{ fontSize: 11, color: "#99adc2" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#e2eaf4" }} />
          </div>

          <div
            style={{
              opacity: btnEnter,
              transform: `translateY(${interpolate(btnEnter, [0, 1], [12, 0])}px) scale(${interpolate(btnEnter, [0, 1], [0.95, 1])})`,
            }}
          >
            <div
              style={{
                background: "#1a1a2e",
                color: "#fff",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              Take a Photo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Scene 4 UI: Process + Success panel
// ---------------------------------------------------------------
function ProcessPanel({ localFrame }: { localFrame: number }) {
  const { fps } = useVideoConfig();

  const panelEnter = spring({
    frame: localFrame,
    fps,
    config: { damping: 45, stiffness: 130 },
  });

  const processPulse = interpolate(
    Math.sin(localFrame * 0.4),
    [-1, 1],
    [1.0, 1.03]
  );

  const successEnter = spring({
    frame: localFrame - 7,
    fps,
    config: { damping: 42, stiffness: 140 },
  });

  const calEnter = spring({
    frame: localFrame - 10,
    fps,
    config: { damping: 45, stiffness: 120 },
  });

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: "28px",
        fontFamily,
        opacity: panelEnter,
        transform: `translateY(${interpolate(panelEnter, [0, 1], [24, 0])}px)`,
      }}
    >
      {/* Preview placeholder */}
      <div
        style={{
          background: "#eef3f9",
          borderRadius: 10,
          height: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          fontSize: 24,
        }}
      >
        <span style={{ opacity: 0.6 }}>🔱</span>
      </div>

      {/* action buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            flex: 1,
            background: "#f0f4fa",
            color: "#445a78",
            borderRadius: 10,
            padding: "8px",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Reselect File
        </div>
        <div
          style={{
            flex: 1,
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: 10,
            padding: "8px",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            transform: `scale(${processPulse})`,
            boxShadow: `0x ${Math.round(processPulse * 6)}px ${Math.round(processPulse * 16)}px )rgba(26,26,46,0.3)`,
          }}
        >
          Process Photo
        </div>
      </div>

      {/* success confirmation */}
      <div
        style={{
          opacity: successEnter,
          transform: `translateY(${interpolate(successEnter, [0, 1], [18, 0])}px)`,
          background: "#f0faf4",
          border: "1px solid #bce6d1",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#2ea36a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7L5.5 10.5L12 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span
          style={{ fontSize: 13, fontWeight: 600, color: "#1a3c26" }}
        >
          Event added to calendar
        </span>
      </div>

      {/* calendar row */}
      <div
        style={{
          opacity: calEnter,
          transform: `translateY(${interpolate(calEnter, [0, 1], [12, 0])}px)`,
          background: "#f7f9fc",
          border: "1px solid #e2eaf4",
          borderRadius: 10,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              background: "#ea4335",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>GC</span>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1a1a2e" }}>
              Google Calendar
            </div>
            <div style={{ fontSize: 10, color: "#99adc2" }}>Not connected</div>
          </div>
        </div>
        <div
          style={{
            background: "#f0f4fa",
            color: "#445a78",
            borderRadius: 8,
            padding: "5px 12px",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Connect
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Scene 1: Brand hook (frames 0-12)
// ---------------------------------------------------------------
function Scene1({ globalFrame }: { globalFrame: number }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const bgOpacity = interpolate(frame, [0, 8], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });
  const bgScale = interpolate(frame, [0, 8], [1.04, 1.0], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  const flyerEnter = spring({
    frame,
    fps,
    config: { damping: 40, stiffness: 180 },
  });

  const counterEnter = spring({
    frame: frame - 2,
    fps,
    config: { damping: 35, stiffness: 160 },
  });
  const counterScale = interpolate(counterEnter, [0, 1], [0.7, 1.0]);

  const subEnter = spring({
    frame: frame - 4,
    fps,
    config: { damping: 45, stiffness: 130 },
  });

  const floatY = Math.sin(frame * 0.18) * 1.5;
  const glowPulse = 0.3 + Math.sin(frame * 0.15) * 0.15;

  const displayCount = Math.round(counterValue(globalFrame));

  return (
    <AbsoluteFill
      style={{
        opacity: bgOpacity,
        transform: `scale(${bgScale})`,
        overflow: "hidden",
      }}
    >
      <GradientMesh frame={globalFrame} />
      <div style={{ position: "absolute", inset: 0 }}>
        <Particles count={16} frame={globalFrame} />
      </div>

      {/* center content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Flyer wordmark */}
        <div
          style={{
            opacity: flyerEnter,
            transform: `translateY(${interpolate(flyerEnter, [0, 1], [28, 0])}px) translateY(${floatY}px)`,
          }}
        >
          <span
            style={{
              fontSize: 136,
              fontWeight: 800,
              letterSpacing: "-4px",
              color: "#1a1a2e",
              fontFamily,
              lineHeight: 1,
            }}
          >
            Flyer
          </span>
        </div>

        {/* Counter */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Glow behind counter */}
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(100,150,220,${glowPulse}) 0%, transparent 70%)`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              fontSize: 200,
              fontWeight: 800,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: "#1a1a2e",
              fontFamily,
              opacity: counterEnter,
              transform: `scale(${counterScale}) translateY(${interpolate(counterEnter, [0, 1], [16, 0])}px) translateY(${floatY * 0.5}px) `,
            }}
          >
            {displayCount}
          </span>

          <span
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#667ea6",
              fontFamily,
              opacity: subEnter * 0.8,
              letterSpacing: "0.2px",
            }}
          >
            people using Flyer
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------
// Scene 2: Counter momentum surge (frames 10-27)
// ---------------------------------------------------------------
function Scene2({ globalFrame }: { globalFrame: number }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, 8], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  const cameraScale = interpolate(frame, [10, 17], [1.0, 1.06], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const floatY = Math.sin(globalFrame * 0.15) * 1.5;
  const glowPulse = 0.3 + Math.sin(globalFrame * 0.12) * 0.15;
  const displayCount = Math.round(counterValue(globalFrame));

  const chips = [
    { text: "Scan Your Flyer", delay: 2, fromY: 24, fromX90},
    { text: "Take a Photo", delay: 4, fromY: 0, fromX: -60 },
    { text: "Process Photo", delay: 6, fromY: 0, fromX: 60 },
    { text: "Google Calendar", delay: 8, fromY: -24, fromX: 0 },
  ];

  const chipPositions = [
    { top: "22%", left: "19%" },
    { top: "38%", left: "68%" },
    { top: "63%", left: "16%" },
    { top: "68%", left: "65%" },
  ];

  return (
    <AbsoluteFill style={{ opacity: enterOpacity, overflow: "hidden" }}>
      <div style={{ transform: `scale(${cameraScale})`, width: "100%", height: "100%", position: "relative" }}>
        <GradientMesh frame={globalFrame} intensity={1.3} />
        <div style={{ position: "absolute", inset: 0 }}>
          <Particles count={18} frame={globalFrame} />
        </div>

        {/* Rotating ring */}
        <svg
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) rotate(${globalFrame * 0.3}deg)`,
            opacity: 0.1,
            pointerEvents: "none",
          }}
          width="480"
          height="480"
        >
          <circle
            cx="240"
            cy="240"
            r="232"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="1.5"
            strokeDasharray="8 12"
          />
        </svg>

        {/* Center counter */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: `radial-gradient(circle, rgba(100,150,220,${glowPulse}) 0%, transparent 70%)`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
            <span
              style={{
                fontSize: 288,
                fontWeight: 800,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                color: "#1a1a2e",
                fontFamily,
                transform: `translateY(${floatY}px)`,
              }}
            >
              {displayCount}
            </span>
          </div>
        </div>

        {/* Chips */}
        {chips.map((chip, i) => {
          const chipSpring = spring({
            frame: frame - chip.delay,
            fps,
            config: { damping: 42, stiffness: 150 },
          });
          const driftY =
            Math.sin(globalFrame * 0.12 + i * 1.2) * 5;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: chipPositions[i].top,
                left: chipPositions[i].left,
                opacity: chipSpring *
                  interpolate(frame, [14, 17], [1, 0.8], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                transform: `translate(${interpolate(chipSpring, [0, 1], [chip.fromX, 0])}px, ${interpolate(chipSpring, [0, 1], [chip.fromY, driftY])}px) rotate(${interpolate(chipSpring, [0, 1], [-3, 0])}deg)`,
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(26,26,46,0.08)",
                borderRadius: 40,
                padding: "8px 18px",
                fontSize: 18,
                fontWeight: 600,
                color: "#1a1a2e",
                fontFamily,
                boxShadow: "0 4px 18px rgba(0,0,0,0.07)",
                whiteSpace: "nowrap",
              }}
            >
              {chip.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------
// Scene 3: Browser reveal (frames 24-42)
// ---------------------------------------------------------------
function Scene3({ globalFrame }: { globalFrame: number }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, 12], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  const browserEnter = spring({
    frame,
    fps,
    config: { damping: 42, stiffness: 130, mass: 1.2 },
  });
  const browserY = interpolate(browserEnter, [0, 1], [90, 0]);
  const browserScale = interpolate(browserEnter, [0, 1], [0.74, 0.9]);

  const rotateYSettle = interpolate(browserEnter, [0, 1], [14, 10]);
  const rotateXSettle = interpolate(browserEnter, [0, 1], [-10, -6]);

  const pushInScale = interpolate(frame, [10, 18], [0.9, 0.97], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const drift = Math.sin(globalFrame * 0.12) * 2.5;

  return (
    <AbsoluteFill style={{ opacity: enterOpacity, overflow: "hidden" }}>
      <GradientMesh frame={globalFrame} intensity={1.5} />

      {/* Spotlight behind browser */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          left: "25%",
          top: "-15%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,240,255,0.6) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "absolute", inset: 0 }}>
        <Particles count={12} frame={globalFrame} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            perspective: 1200,
            transform: `scale(${pushInScale}) translateY(${drift}px)`,
          }}
        >
          <div
            style={{
              transform: `translateY(${browserY}px) scale(${browserScale}) rotateX(${rotateXSettle}deg) rotateY(${rotateYSettle}deg)`,
              opacity: browserEnter,
              transformStyle: "preserve-3d",
              boxShadow: "0 20px 60px -10px rgba(0,0,0,0.18), 0 40px 80px -20px rgba(0,0,0,0.1)",
              borderRadius: 16,
              overflow: "hidden",
              width: 640,
            }}
          >
            <FloatingBrowser
              url="flyer.it.com"
              width={640}
              shadow={false}
              rotateX={0}
              rotateY={0}
              scale={1}
              enterDelay={0}
              durationInFrames={180}
            >
              <FlyerAppUI localFrame={frame} />
            </FloatingBrowser>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------
// Scene 4: Process + Success proof (frames 39-53)
// ---------------------------------------------------------------
function Scene4({ globalFrame }: { globalFrame: number }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, 10], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  const zoomScale = interpolate(frame, [0, 6], [1.0, 1.35], {
    easing: Easing.inOut(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const counterOverlaySpring = spring({
    frame: frame - 11,
    fps,
    config: { damping: 40, stiffness: 140 },
  });
  const displayCount = Math.round(counterValue(globalFrame));

  return (
    <AbsoluteFill style={{ opacity: enterOpacity, overflow: "hidden" }}>
      <GradientMesh frame={globalFrame} intensity={1.6} />
      <div style={{ position: "absolute", inset: 0 }}>
        <Particles count={10} frame={globalFrame} />
      </div>

      {/* Zoomed process panel */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoomScale})`,
        }}
      >
        <div style={{ width: 490, perspective: 1200 }}>
          <ProcessPanel localFrame={frame} />
        </div>
      </div>

      {/* Corner counter overlay */}
      <div
        style={{
          position: "absolute",
          top: 56,
          right: 72,
          opacity: counterOverlaySpring,
          transform: `translateX(${interpolate(counterOverlaySpring, [0, 1], [40, 0])}px) scale(${interpolate(counterOverlaySpring, [0, 1], [0.85, 1])})`,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 16,
          padding: "12px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            color: "#1a1a2e",
            fontFamily,
          }}
        >
          {displayCount}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#667ea6",
            fontFamily,
            fontWeight: 500,
          }}
        >
          people using Flyer
        </span>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------
// Scene 5: Final lockup (frames 50-60)
// ---------------------------------------------------------------
function Scene5({ globalFrame }: { globalFrame: number }) {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, 10], [0, 1], {
    easing: Easing.out(Easing.quad),
    extrapolateRight: "clamp",
  });

  const displayCount = Math.round(counterValue(globalFrame));

  const flyerEnter = spring({
    frame: frame - 2,
    fps,
    config: { damping: 40, stiffness: 160 },
  });

  const gentleFloat = Math.sin(globalFrame * 0.12) * 2.5;
  const glowPulse = 0.35 + Math.sin(globalFrame * 0.18) * 0.18;

  // Shimmer on Flyer name
  const shimmerX = interpolate(frame, [2, 10], [-240, 240], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: enterOpacity, overflow: "hidden" }}>
      <GradientMesh frame={globalFrame} intensity={2.0} />

      {/* Orbit ring */}
      <svg
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) rotate(${globalFrame * 0.25}deg)`,
          opacity: 0.08,
          pointerEvents: "none",
        }}
        width="700"
        height="700"
      >
        <circle
          cx="350"
          cy="350"
          r="340"
          fill="none"
          stroke="#1a1a2e"
          strokeWidth="2"
          strokeDasharray="10 16"
        />
      </svg>

      <div style={{ position: "absolute", inset: 0 }}>
        <Particles count={14} frame={globalFrame} />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        {/* Large 100 counter */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              width: 560,
              height: 560,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(100,150,220,${glowPulse}) 0%, transparent 65%)`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              fontSize: 360,
              fontWeight: 800,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              color: "#1a1a2e",
              fontFamily,
              transform: `translateY(${gentleFloat}px)`,
            }}
          >
            {displayCount}
          </span>
        </div>

        {/* Flyer lockup */}
        <div
          style={{
            opacity: flyerEnter,
            transform: `translateY(${interpolate(flyerEnter, [0, 1], [20, 0])}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-2px",
              fontFamily,
              background: `linear-gradient(120deg, #1a1a2e ${Math.max(0, shimmerX - 60)}px, #4a7db8 ${shimmerX}px, #1a1a2e ${shimmerX + 60}px)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Flyer
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: "#667ea6",
              fontFamily,
              letterSpacing: "0.2px",
            }}
          >
            Scan Your Flyer
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ---------------------------------------------------------------
// Light Leak overlay
// ---------------------------------------------------------------
function LightLeakOverlay({
  peak=0.5,
  color = "rgba(230,240,255,1)",
}: {
  peak?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  // local frame: 0 at start of overlap
  // peak at middle of transition
  const OVERLAP_LEN = 6; // frames overlap length
  const half = OVERLAP_LEN / 2;
  let opacity;
  if (frame <= half) {
    opacity = interpolate(frame, [0, half], [0, peak], {
      easing: Easing.out(Easing.quad),
      extrapolateRight: "clamp",
    });
  } else {
    opacity = interpolate(frame, [half, OVERLAP_LEN], [peak, 0], {
      easing: Easing.in(Easing.quad),
      extrapolateRight: "clamp",
    });
  }
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${color} 0%, transparent 70%)`,
        pointerEvents: "none",
      }}
    />
  );
}

// ---------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------
export function FlyerSting() {
  const frame = useCurrentFrame();

  // Scene visibility (with overlaps)
  // Scene1:   0-12 (full), start exit at 10
  // Scene2: 10-27 (with enter overlap from 10)
  // Scene3: 24-42 (with enter overlap from 24)
  // Scene4: 39-53 (with enter overlap from 39)
  // Scene5: 50-60 (with enter overlap from 50)

  const scene1Opacity = interpolate(frame, [10, 14], [1, 0], {
    easing: Easing.in(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scene2Opacity = interpolate(
    frame,
    [24, 28],
    [1, 0],
    {
      easing: Easing.in(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const scene3Opacity = interpolate(
    frame,
    [39, 43],
    [1, 0],
    {
      easing: Easing.in(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const scene4Opacity = interpolate(
    frame,
    [50, 54],
    [1, 0],
    {
      easing: Easing.in(Easing.quad),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        background: "#f7f9fc",
        fontFamily,
        overflow: "hidden",
      }}
    >
      {/* Scene 1 */}
      {frame <= 14 && (
        <div style={{ position: "absolute", inset: 0, opacity: scene1Opacity }}>
          <Sequence from={0} durationInFrames={14} premountFor={0}>
            <Scene1 globalFrame={frame} />
          </Sequence>
        </div>
      )}

      {/* Scene 2 */}
      {frame >= 10 && frame <= 28 && (
        <div style={{ position: "absolute", inset: 0, opacity: scene2Opacity }}>
          <Sequence from={10} durationInFrames={18} premountFor={0}>
            <Scene2 globalFrame={frame} />
          </Sequence>
        </div>
      )}

      {/* Light leak 1->2 */}
      {frame >= 10 && frame <= 16 && (
        <Sequence from={10} durationInFrames={6} premountFor={0}>
          <LightLeakOverlay peak={0.35} />
        </Sequence>
      )}

      {/* Scene 3 */}
      {frame >= 24 && frame <= 43 && (
        <div style={{ position: "absolute", inset: 0, opacity: scene3Opacity }}>
          <Sequence from={24} durationInFrames={19} premountFor={0}>
            <Scene3 globalFrame={frame} />
          </Sequence>
        </div>
      )}

      {/* Light leak 2->3 */}
      {frame >= 24 && frame <= 30 && (
        <Sequence from={24} durationInFrames={6} premountFor={0}>
          <LightLeakOverlay peak={0.25} />
        </Sequence>
      )}

      {/* Scene 4 */}
      {frame >= 39 && frame <= 54 && (
        <div style={{ position: "absolute", inset: 0, opacity: scene4Opacity }}>
          <Sequence from={39} durationInFrames={15} premountFor={0}>
            <Scene4 globalFrame={frame} />
          </Sequence>
        </div>
      )}

      {/* Light leak 4->5 */}
      {frame >= 50 && frame <= 56 && (
        <Sequence from={50} durationInFrames={6} premountFor={0}>
          <LightLeakOverlay peak={0.25} />
        </Sequence>
      )}

      {/* Scene 5 */}
      {frame >= 50 && (
        <Sequence from={50} durationInFrames={10} premountFor={0}>
          <Scene5 globalFrame={frame} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
}
