import type { CSSProperties, ReactNode } from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/** Height of traffic-light + URL bar; page mockup starts **below** this in the white content area. */
export const BROWSER_FRAME_CHROME_HEIGHT = 36;

type BrowserFrameProps = {
  children: ReactNode;
  url?: string;
  width?: number;
  shadow?: boolean;
  darkMode?: boolean;
  style?: CSSProperties;
};

export function BrowserFrame({
  children,
  url = "app.example.com",
  width = 1200,
  shadow = true,
  darkMode = false,
  style,
}: BrowserFrameProps) {
  const barBg = darkMode
    ? "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)"
    : "linear-gradient(180deg, #e8e8e8 0%, #d4d4d4 100%)";
  const urlBg = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const urlColor = darkMode ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  const frameBg = darkMode ? "#1a1a1a" : "#e0e0e0";

  return (
    <div
      style={{
        width,
        borderRadius: 12,
        overflow: "hidden",
        background: frameBg,
        boxShadow: shadow
          ? "0 40px 80px -20px rgba(0,0,0,0.45), 0 20px 40px -10px rgba(0,0,0,0.15)"
          : "none",
        ...style,
      }}
    >
      <div
        style={{
          height: BROWSER_FRAME_CHROME_HEIGHT,
          background: barBg,
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
            background: urlBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: urlColor,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {url}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

type FloatingBrowserProps = BrowserFrameProps & {
  rotateX?: number;
  rotateY?: number;
  scale?: number;
  enterDelay?: number;
  durationInFrames?: number;
};

/**
 * Browser frame floating in 3D space with perspective, gentle drift,
 * and spring entrance/exit.
 */
export function FloatingBrowser({
  rotateX = -8,
  rotateY = 12,
  scale: targetScale = 0.85,
  enterDelay = 0,
  durationInFrames = 150,
  ...browserProps
}: FloatingBrowserProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterDelay,
    fps,
    config: { damping: 20, stiffness: 60, mass: 1.2 },
  });
  const entryY = interpolate(enter, [0, 1], [120, 0], { extrapolateRight: "clamp" });
  const entryScale = interpolate(enter, [0, 1], [0.7, targetScale], {
    extrapolateRight: "clamp",
  });

  const exitStart = durationInFrames - 15;
  const exitOpacity = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [exitStart, durationInFrames], [1, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const drift = Math.sin(frame * 0.015) * 3;
  const rotDrift = Math.sin(frame * 0.02) * 1.5;

  return (
    <div style={{ perspective: 1200, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          transform: `
            translateY(${entryY + drift}px)
            scale(${entryScale * exitScale})
            rotateX(${rotateX + rotDrift}deg)
            rotateY(${rotateY - rotDrift * 0.5}deg)
          `,
          opacity: enter * exitOpacity,
          transformStyle: "preserve-3d",
        }}
      >
        <BrowserFrame {...browserProps} />
      </div>
    </div>
  );
}
