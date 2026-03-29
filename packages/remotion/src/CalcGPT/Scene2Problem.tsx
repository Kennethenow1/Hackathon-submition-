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
import { PALETTE } from './constants';
import { GradientMesh } from './GradientMesh';
import { Particles } from './Particles';
import { WordByWord } from './WordByWord';

const { fontFamily: interFamily } = loadInter();

const ProblemCard: React.FC<{
  delay: number;
  title: string;
  desc: string;
  rotate: number;
  idx: number;
}> = ({ delay, title, desc, rotate, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 80 } });
  const x = interpolate(s, [0, 1], [-80, 0]);
  const rot = interpolate(s, [0, 1], [-6, rotate]);
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const floatY = Math.sin(frame * 0.025 + idx) * 4;

  return (
    <div
      style={{
        transform: `translateX(${x}px) translateY(${floatY}px) rotate(${rot}deg)`,
        opacity,
        background: PALETTE.bgSurfaceElevated,
        border: `1px solid ${PALETTE.borderPrimary}`,
        borderRadius: 28,
        padding: 24,
        marginBottom: 16,
        fontFamily: interFamily,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600, color: PALETTE.textPrimary, marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ fontSize: 15, color: PALETTE.textSecondary }}>{desc}</div>
    </div>
  );
};

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entranceOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const exitOpacity = interpolate(frame, [150, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  const rightS = spring({ frame: frame - 18, fps, config: { damping: 18, stiffness: 70 } });
  const rightY = interpolate(rightS, [0, 1], [40, 0]);
  const rightOpacity = interpolate(rightS, [0, 1], [0, 1]);

  // Error badge pulse
  const badgePulse = interpolate(
    Math.sin((frame - 34) * 0.15),
    [-1, 1],
    [0.7, 1.0]
  );
  const badgeVisible = frame >= 34;

  // Before/after wipe
  const wipeProgress = interpolate(frame, [70, 130], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{ background: PALETTE.bgPrimary, opacity: entranceOpacity * exitOpacity }}
    >
      <GradientMesh
        colors={['#1a1a1a', '#0a0a0a', '#8b5cf6', '#3b82f6']}
        baseColor={PALETTE.bgPrimary}
      />

      {/* Stress orb */}
      <div
        style={{
          position: 'absolute',
          right: '30%',
          top: '20%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,76,60,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles
          count={12}
          colors={['rgba(139,92,246,0.3)', 'rgba(59,130,246,0.25)', 'rgba(231,76,60,0.2)']}
        />
      </AbsoluteFill>

      {/* Faint grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
        }}
      />

      {/* Left: stacked problem cards */}
      <div
        style={{
          position: 'absolute',
          left: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '44%',
        }}
      >
        <ProblemCard
          delay={8}
          title="📋 Handwritten notes everywhere"
          desc="Scattered papers, wrong steps, no clear path forward."
          rotate={-2}
          idx={0}
        />
        <ProblemCard
          delay={14}
          title="🤖 Generic AI gives you answers"
          desc="No explanation. No understanding. Just a number."
          rotate={-1}
          idx={1}
        />
        <ProblemCard
          delay={20}
          title="🌐 10 tabs open, still confused"
          desc="Wolfram, YouTube, Khan Academy, Reddit... overload."
          rotate={1}
          idx={2}
        />

        {/* Error badge */}
        {badgeVisible && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: -12,
              background: '#e74c3c',
              color: '#fff',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 14,
              fontWeight: 700,
              fontFamily: interFamily,
              transform: `scale(${badgePulse})`,
              boxShadow: '0 0 16px rgba(231,76,60,0.5)',
            }}
          >
            ✗ Wrong
          </div>
        )}
      </div>

      {/* Diagonal divider */}
      <div
        style={{
          position: 'absolute',
          left: '48%',
          top: 0,
          bottom: 0,
          width: 2,
          background:
            'linear-gradient(180deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent)',
          transform: 'skewX(-3deg)',
        }}
      />

      {/* Right: copy */}
      <div
        style={{
          position: 'absolute',
          right: '4%',
          top: '50%',
          transform: `translateY(calc(-50% + ${rightY}px))`,
          opacity: rightOpacity,
          width: '46%',
          fontFamily: interFamily,
        }}
      >
        <h2
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: PALETTE.textPrimary,
            lineHeight: 1.15,
            margin: 0,
            marginBottom: 20,
          }}
        >
          <WordByWord
            text="Too many tabs. Not enough clarity."
            startFrame={18}
            gapFrames={4}
            highlightWords={['clarity.']}
            highlightColor={PALETTE.accentPurple}
          />
        </h2>
        <p style={{ fontSize: 22, color: PALETTE.textSecondary, lineHeight: 1.7, margin: 0 }}>
          Students waste hours on fragmented tools instead of actually learning.
        </p>

        {/* Dimmed silhouette of clean workspace */}
        <div
          style={{
            marginTop: 32,
            borderRadius: 20,
            overflow: 'hidden',
            clipPath: `inset(0 ${100 - wipeProgress}% 0 0)`,
            background: PALETTE.bgSurface,
            border: `1px solid ${PALETTE.borderPrimary}`,
            padding: 24,
            opacity: 0.4,
          }}
        >
          <div
            style={{
              height: 12,
              width: '60%',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.1)',
              marginBottom: 12,
            }}
          />
          <div
            style={{
              height: 12,
              width: '80%',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.07)',
              marginBottom: 12,
            }}
          />
          <div
            style={{
              height: 12,
              width: '45%',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.05)',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
