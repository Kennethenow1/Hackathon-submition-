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

const SCENE_DURATION = 180;

export const Scene1Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const bgScale = interpolate(frame, [0, 18], [1.08, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Camera push in
  const cameraPush = interpolate(frame, [60, 150], [1.0, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Orb entrance
  const orbSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 80, mass: 1.1 },
  });
  const orbScale = interpolate(orbSpring, [0, 1], [0.72, 1.0]);
  const orbRotY = interpolate(orbSpring, [0, 1], [-18, 0]);
  const orbOpacity = interpolate(frame, [8, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const orbDrift = Math.sin(frame * 0.04) * 6;
  const glowPulse = interpolate(Math.sin(frame * (Math.PI * 2) / 36), [-1, 1], [0.3, 0.6]);

  // Title stagger
  const letters = ["G", "I", "S", "O", "M", "N", "I"];
  const titleLetters = letters.map((l, i) => {
    const delay = 16 + i * 5;
    const prog = interpolate(frame, [delay, delay + 18], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    const tz = interpolate(prog, [0, 1], [80, 0]);
    return { letter: l, opacity: prog, translateZ: tz };
  });

  // Tagline
  const tagOpacity = interpolate(frame, [38, 64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [38, 64], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Exit
  const exitOpacity = interpolate(frame, [150, 180], [1, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitScale = interpolate(frame, [150, 180], [1, 0.98], {
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
          transform: `scale(${bgScale * cameraPush * exitScale})`,
        }}
      >
        <GradientMeshBg
          colors={["#111111", "#444444", "#999999", "#ffffff"]}
          baseColor="#0a0a0e"
        />
      </div>

      <Particles count={24} color="rgba(255,255,255,0.35)" maxSize={2.5} speed={0.2} seed={11} />
      <LensFlare x={72} y={28} size={350} color="#999999" />
      <LensFlare x={30} y={65} size={250} color="#666666" />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: exitOpacity,
          transform: `scale(${exitScale})`,
        }}
      >
        {/* Dashed ring */}
        <div
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            border: "1px dashed rgba(255,255,255,0.12)",
            opacity: orbOpacity * 0.5,
          }}
        />

        {/* Globe orb */}
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 50%, transparent 70%), radial-gradient(circle at 50% 50%, #333333 0%, #111111 100%)`,
            boxShadow: `0 0 ${60 + glowPulse * 40}px rgba(255,255,255,${glowPulse * 0.15}), inset 0 0 30px rgba(255,255,255,0.05)`,
            transform: `scale(${orbScale}) rotateY(${orbRotY}deg) translateY(${orbDrift}px)`,
            opacity: orbOpacity,
            backdropFilter: "blur(6px)",
            marginBottom: 40,
          }}
        />

        {/* Title */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 30,
            perspective: 1200,
          }}
        >
          {titleLetters.map((l, i) => (
            <span
              key={i}
              style={{
                fontFamily: outfitFamily,
                fontWeight: 200,
                fontSize: 96,
                color: "#ffffff",
                letterSpacing: "0.06em",
                opacity: l.opacity,
                transform: `translateZ(${l.translateZ}px)`,
                display: "inline-block",
              }}
            >
              {l.letter}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: spaceGroteskFamily,
            fontSize: 22,
            fontWeight: 400,
            color: "#999999",
            marginTop: 20,
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.6,
          }}
        >
          Interactive Geospatial Mapping Solutions for global impact.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
