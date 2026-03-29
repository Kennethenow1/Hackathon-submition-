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

const FEATURES = [
  { icon: '📝', title: 'Practice Quizzes', desc: 'Test your knowledge instantly', color: PALETTE.accentPurple, accent: 'rgba(139,92,246,0.15)' },
  { icon: '🃏', title: 'Flashcards', desc: 'Memorize concepts fast', color: '#f59e0b', accent: 'rgba(245,158,11,0.15)' },
  { icon: '🤖', title: 'AI Tutor', desc: 'Ask anything, get clarity', color: PALETTE.accentBlue, accent: 'rgba(59,130,246,0.15)' },
  { icon: '📅', title: 'Course Scheduler', desc: 'Plan your study sessions', color: PALETTE.accentPink, accent: 'rgba(236,72,153,0.15)' },
  { icon: '📊', title: 'Practice Tests', desc: 'Full exam simulations', color: '#10b981', accent: 'rgba(16,185,129,0.15)' },
  { icon: '🎯', title: 'Personalized Learning', desc: 'Adapts to you', color: PALETTE.accentOrange, accent: 'rgba(249,115,22,0.15)' },
];

const FeatureCard: React.FC<{
  feature: typeof FEATURES[0];
  delay: number;
  idx: number;
}> = ({ feature, delay, idx }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 70 } });
  const y = interpolate(s, [0, 1], [60, 0]);
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const rot = interpolate(s, [0, 1], [3, 0]);

  // Hover-lift float
  const floatY = Math.sin(frame * 0.025 + idx * 1.2) * (idx % 2 === 0 ? 3 : 5);

  // Glow pulse
  const glowPulse = interpolate(Math.sin(frame * 0.06 + idx * 0.8), [-1, 1], [0.3, 0.7]);

  // Progress bar (for Practice Tests card)
  const progressWidth = idx === 4
    ? interpolate(frame, [54, 90], [0, 72], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
    : 0;

  return (
    <div
      style={{
        transform: `translateY(${y + floatY}px) rotate(${rot}deg)`,
        opacity,
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(10px)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 20,
        padding: 32,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 0 30px ${feature.color}${Math.round(glowPulse * 20).toString(16).padStart(2, '0')}`,
      }}
    >
      {/* Glow background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: feature.accent,
          opacity: glowPulse * 0.6,
          borderRadius: 20,
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          marginBottom: 16,
          position: 'relative',
        }}
      >
        {feature.icon}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: PALETTE.textPrimary,
          marginBottom: 8,
          fontFamily: interFamily,
          position: 'relative',
        }}
      >
        {feature.title}
      </div>
      <div
        style={{
          fontSize: 15,
          color: PALETTE.textSecondary,
          lineHeight: 1.5,
          fontFamily: interFamily,
          position: 'relative',
        }}
      >
        {feature.desc}
      </div>

      {/* Progress bar for tests card */}
      {idx === 4 && frame >= 54 && (
        <div
          style={{
            marginTop: 16,
            height: 6,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${progressWidth}%`,
              height: '100%',
              background: `linear-gradient(90deg, #10b981, #34d399)`,
              borderRadius: 3,
            }}
          />
        </div>
      )}

      {/* Pulsing chip for personalized learning */}
      {idx === 5 && (
        <div
          style={{
            marginTop: 14,
            display: 'inline-flex',
            padding: '6px 14px',
            background: `rgba(249,115,22,${glowPulse * 0.2})`,
            border: `1px solid rgba(249,115,22,${glowPulse * 0.4})`,
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            color: PALETTE.accentOrange,
            fontFamily: interFamily,
            position: 'relative',
          }}
        >
          Adapts to your pace
        </div>
      )}
    </div>
  );
};

export const Scene7StudyGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Headline
  const headlineS = spring({ frame: frame - 0, fps, config: { damping: 18, stiffness: 70 } });
  const headlineY = interpolate(headlineS, [0, 1], [40, 0]);
  const headlineOpacity = interpolate(headlineS, [0, 1], [0, 1]);

  // Camera dolly
  const camScale = interpolate(frame, [110, 160], [1.0, 1.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const camY = interpolate(frame, [110, 160], [0, -20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Study faster chip
  const chipS = spring({ frame: frame - 170, fps, config: { damping: 18, stiffness: 80 } });
  const chipX = interpolate(chipS, [0, 1], [-60, 0]);
  const chipOpacity = interpolate(chipS, [0, 1], [0, 1]);

  // Exit
  const exitOpacity = interpolate(frame, [216, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ background: PALETTE.bgPrimary, opacity: exitOpacity }}>
      <GradientMesh
        colors={['#8b5cf6', '#3b82f6', '#ec4899', '#f97316']}
        baseColor={PALETTE.bgPrimary}
      />

      {/* Grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles
          count={24}
          colors={['rgba(139,92,246,0.4)', 'rgba(59,130,246,0.35)', 'rgba(236,72,153,0.3)', 'rgba(249,115,22,0.25)']}
        />
      </AbsoluteFill>

      {/* Accent orbs */}
      {[PALETTE.accentPurple, PALETTE.accentBlue, PALETTE.accentPink].map((color, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${15 + i * 35}%`,
            top: `${20 + (i % 2) * 40}%`,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`,
            filter: 'blur(40px)',
            pointerEvents: 'none',
            transform: `translateY(${Math.sin(frame * 0.015 + i) * 15}px)`,
          }}
        />
      ))}

      {/* Camera wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${camScale}) translateY(${camY}px)`,
          transformOrigin: 'center center',
        }}
      >
        {/* Headline */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: `translateX(-50%) translateY(${headlineY}px)`,
            opacity: headlineOpacity,
            textAlign: 'center',
            width: 1200,
          }}
        >
          <h2
            style={{
              fontFamily: interFamily,
              fontSize: 56,
              fontWeight: 700,
              color: PALETTE.textPrimary,
              margin: 0,
              marginBottom: 12,
            }}
          >
            <WordByWord
              text="Everything you need to crush calculus."
              startFrame={0}
              gapFrames={3}
              highlightWords={['crush', 'calculus.']}
              highlightColor={PALETTE.accentPurple}
            />
          </h2>
          <p style={{ fontSize: 20, color: PALETTE.textSecondary, margin: 0, fontFamily: interFamily }}>
            One workspace. Every tool. Your complete study system.
          </p>
        </div>

        {/* Feature grid */}
        <div
          style={{
            position: 'absolute',
            top: 220,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 340px)',
            gap: 24,
          }}
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={i} feature={feature} delay={16 + i * 6} idx={i} />
          ))}
        </div>
      </div>

      {/* Study faster chip */}
      <div
        style={{
          position: 'absolute',
          bottom: '6%',
          left: '4%',
          transform: `translateX(${chipX}px)`,
          opacity: chipOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 22px',
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 40,
          fontFamily: interFamily,
          fontSize: 16,
          fontWeight: 600,
          color: PALETTE.textPrimary,
        }}
      >
        <span style={{ color: PALETTE.accentBlue }}>⚡</span>
        <span>Study faster with CalcGPT</span>
        <span
          style={{
            background: 'linear-gradient(135deg, #8A6BF2, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          →
        </span>
      </div>
    </AbsoluteFill>
  );
};
