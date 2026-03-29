import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { OrbitRing } from './OrbitRing';
import { COLORS } from './colors';

const { loadFont } = require('@remotion/google-fonts/Outfit');
loadFont();

const FLYER_LETTERS = ['F', 'l', 'y', 'e', 'r'];

export const Scene1Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const bgScale = interpolate(frame, [0, 12], [1.06, 1.0], {
    extrapolateRight: 'clamp',
  });

  // Scene exit
  const exitOpacity = interpolate(frame, [72, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [72, 90], [1.0, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Letter-by-letter brand entrance (frames 4-26)
  const letterAnimations = FLYER_LETTERS.map((_, i) => {
    const delay = 4 + i * 4;
    const s = spring({
      frame: frame - delay,
      fps,
      config: { damping: 14, stiffness: 160, mass: 0.8 },
    });
    return {
      scale: interpolate(s, [0, 1], [0.82, 1.0]),
      opacity: interpolate(s, [0, 1], [0, 1]),
      y: interpolate(s, [0, 1], [30, 0]),
    };
  });

  // Supporting lines
  const line1progress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const line1y = interpolate(line1progress, [0, 1], [40, 0]);
  const line1o = interpolate(line1progress, [0, 1], [0, 1]);

  const line2progress = spring({
    frame: frame - 22,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const line2y = interpolate(line2progress, [0, 1], [40, 0]);
  const line2o = interpolate(line2progress, [0, 1], [0, 1]);

  // Highlight sweep on "Save"
  const sweepProgress = interpolate(frame, [26, 46], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Flyer card (frames 18-54)
  const cardS = spring({
    frame: frame - 18,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const cardX = interpolate(cardS, [0, 1], [-500, -260]);
  const cardRotate = interpolate(cardS, [0, 1], [-12, -2]);
  const cardO = interpolate(frame, [18, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Calendar tile (frames 34-72)
  const calS = spring({
    frame: frame - 34,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const calScale = interpolate(calS, [0, 1], [0.88, 1.0]);
  const calO = interpolate(frame, [34, 52], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const calGlow = interpolate(
    Math.sin((frame - 34) * (Math.PI / 18)),
    [-1, 1],
    [0.2, 0.6]
  );

  // Camera push-in (frames 50-82)
  const pushScale = interpolate(frame, [50, 82], [1.0, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
        fontFamily: 'Outfit, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background */}
      <div style={{ opacity: bgOpacity, transform: `scale(${bgScale})`, position: 'absolute', inset: 0 }}>
        <GradientMeshBg
          colors={[COLORS.accent, COLORS.accentLight, COLORS.accentSoft, COLORS.bgLight]}
          dark={false}
        />
      </div>

      {/* Camera push wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${pushScale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Particles */}
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
          <Particles count={16} color={`rgba(99,102,241,0.35)`} />
        </AbsoluteFill>

        {/* Orbit ring behind calendar */}
        <div
          style={{
            position: 'absolute',
            right: 240,
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <OrbitRing size={240} speed={0.3} color="rgba(99,102,241,0.12)" cx="50%" cy="50%" />
        </div>

        {/* Flyer card (left) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginTop: -120,
            opacity: cardO,
            transform: `translateX(${cardX}px) translateY(-50%) rotate(${cardRotate}deg)`,
          }}
        >
          <div
            style={{
              width: 180,
              height: 240,
              borderRadius: 16,
              background: 'linear-gradient(145deg, #fff 0%, #f0f4ff 100%)',
              boxShadow: '0 24px 60px -12px rgba(99,102,241,0.28), 0 8px 24px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 12,
                background: COLORS.accentSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke={COLORS.accent} strokeWidth="2" />
                <path d="M8 7h8M8 11h8M8 15h5" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.textPrimary, textAlign: 'center' }}>Event Flyer</div>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 1.4 }}>Saturday 7PM{`\n`}Community Hall</div>
          </div>
        </div>

        {/* Arrow between flyer and calendar */}
        {cardO > 0.3 && calO > 0.1 && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: Math.min(cardO, calO),
            }}
          >
            <svg width="80" height="32" viewBox="0 0 80 32">
              <path
                d="M 0 16 L 64 16 M 54 6 L 76 16 L 54 26"
                stroke={COLORS.accent}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        )}

        {/* Calendar tile (right) */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            marginLeft: 80,
            opacity: calO,
            transform: `translateY(-50%) scale(${calScale})`,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 20,
              background: 'linear-gradient(145deg, #6366f1 0%, #818cf8 100%)',
              boxShadow: `0 20px 50px -10px rgba(99,102,241,${calGlow}), 0 8px 20px rgba(0,0,0,0.12)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Calendar</div>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Event saved!</div>
          </div>
        </div>

        {/* Hero text stack */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginTop: -160,
          }}
        >
          {/* Brand wordmark */}
          <div style={{ display: 'flex', gap: 1 }}>
            {FLYER_LETTERS.map((letter, i) => (
              <span
                key={i}
                style={{
                  fontSize: 96,
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                  lineHeight: 0.95,
                  display: 'inline-block',
                  transform: `scale(${letterAnimations[i].scale}) translateY(${letterAnimations[i].y}px)`,
                  opacity: letterAnimations[i].opacity,
                  letterSpacing: -2,
                }}
              >
                {letter}
              </span>
            ))}
          </div>

          {/* Line 1 */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: COLORS.textSecondary,
              transform: `translateY(${line1y}px)`,
              opacity: line1o,
            }}
          >
            See a flyer.
          </div>

          {/* Line 2 with highlight sweep */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: COLORS.textSecondary,
              transform: `translateY(${line2y}px)`,
              opacity: line2o,
              position: 'relative',
            }}
          >
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: '38%',
                  width: `${sweepProgress}%`,
                  background: COLORS.accentSoft,
                  borderRadius: 4,
                  opacity: 0.7,
                  zIndex: 0,
                }}
              />
              <span style={{ position: 'relative', zIndex: 1, fontWeight: 700, color: COLORS.accent }}>Save</span>
            </span>
            <span> the event.</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
