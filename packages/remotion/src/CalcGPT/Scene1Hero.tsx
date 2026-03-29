import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';
import { PALETTE } from './constants';
import { GradientMesh } from './GradientMesh';
import { Particles } from './Particles';
import { WordByWord } from './WordByWord';

const { fontFamily: interFamily } = loadInter();
const { fontFamily: ralewayFamily } = loadRaleway();

const FloatingMathCard: React.FC<{
  x: string;
  y: string;
  content: string;
  delay: number;
  rotDir?: 1 | -1;
}> = ({ x, y, content, delay, rotDir = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 60 } });
  const entryY = interpolate(s, [0, 1], [60, 0]);
  const entryOpacity = interpolate(s, [0, 1], [0, 1]);
  const rot = interpolate(s, [0, 1], [4 * rotDir, 0]);
  const floatY = Math.sin(frame * 0.03 + delay) * 7;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translateY(${entryY + floatY}px) rotate(${rot}deg)`,
        opacity: entryOpacity,
        background: PALETTE.bgSurfaceElevated,
        border: `1px solid ${PALETTE.borderPrimary}`,
        borderRadius: 16,
        padding: '12px 20px',
        fontFamily: interFamily,
        fontSize: 22,
        color: PALETTE.textPrimary,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
      }}
    >
      {content}
    </div>
  );
};

export const Scene1Hero: React.FC<{ startFrame?: number }> = ({ startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Background fade in
  const bgOpacity = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Camera push
  const camScale = interpolate(frame, [90, 162], [1.0, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Exit fade
  const exitOpacity = interpolate(frame, [156, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  // Subline
  const sublineOpacity = interpolate(frame, [34, 72], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const sublineY = interpolate(frame, [34, 72], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Dashed ring rotation
  const ringRot = frame * 0.4;

  return (
    <AbsoluteFill
      style={{ background: PALETTE.bgPrimary, opacity: bgOpacity * exitOpacity }}
    >
      <GradientMesh
        colors={['#8b5cf6', '#3b82f6', '#ec4899', '#f97316']}
        baseColor={PALETTE.bgPrimary}
      />

      {/* Mid-layer particles */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles
          count={18}
          colors={[
            'rgba(139,92,246,0.6)',
            'rgba(59,130,246,0.5)',
            'rgba(236,72,153,0.4)',
          ]}
        />
      </AbsoluteFill>

      {/* Orbit ring behind title */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${ringRot}deg)`,
          pointerEvents: 'none',
        }}
      >
        <svg width="700" height="700">
          <circle
            cx="350"
            cy="350"
            r="340"
            fill="none"
            stroke="rgba(139,92,246,0.12)"
            strokeWidth="1"
            strokeDasharray="12 18"
          />
        </svg>
      </div>

      {/* Orb accents */}
      <div
        style={{
          position: 'absolute',
          left: '10%',
          top: '20%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transform: `translateY(${Math.sin(frame * 0.01) * 20}px)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '8%',
          bottom: '15%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          filter: 'blur(50px)',
          transform: `translateY(${Math.cos(frame * 0.012) * 18}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Camera push wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${camScale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Center headline stack */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: 1200,
          }}
        >
          {/* CalcGPT label */}
          <div
            style={{
              fontFamily: interFamily,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: PALETTE.accentBlue,
              marginBottom: 20,
            }}
          >
            <WordByWord
              text="CalcGPT"
              startFrame={6}
              gapFrames={6}
            />
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontFamily: ralewayFamily,
              fontSize: 96,
              fontWeight: 500,
              lineHeight: 1.08,
              margin: 0,
              marginBottom: 28,
              color: PALETTE.textPrimary,
            }}
          >
            <WordByWord
              text="This AI makes you better at math"
              startFrame={18}
              gapFrames={5}
              highlightWords={['AI', 'better']}
              highlightColor="#8A6BF2"
            />
          </h1>

          {/* Subline */}
          <p
            style={{
              fontFamily: interFamily,
              fontSize: 24,
              color: PALETTE.textSecondary,
              lineHeight: 1.7,
              margin: 0,
              opacity: sublineOpacity,
              transform: `translateY(${sublineY}px)`,
            }}
          >
            Breaking down complex problems into simple, understandable steps.
          </p>
        </div>

        {/* Floating math cards */}
        <FloatingMathCard
          x="5%"
          y="18%"
          content="∫ x² dx = x³/3 + C"
          delay={24}
          rotDir={1}
        />
        <FloatingMathCard
          x="78%"
          y="14%"
          content="y = mx + b"
          delay={34}
          rotDir={-1}
        />
        <FloatingMathCard
          x="6%"
          y="72%"
          content="lim x→∞ f(x)"
          delay={44}
          rotDir={-1}
        />
      </div>
    </AbsoluteFill>
  );
};
