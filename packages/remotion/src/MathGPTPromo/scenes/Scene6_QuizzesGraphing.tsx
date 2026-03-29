import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { GradientMeshBg } from '../helpers/GradientMeshBg';
import { Particles } from '../helpers/Particles';
import { OrbitRing } from '../helpers/OrbitRing';
import { FeatureCard } from '../helpers/FeatureCard';
import { WordByWord } from '../helpers/WordByWord';
import { COLORS } from '../constants';

export const Scene6_QuizzesGraphing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera drift
  const cameraX = interpolate(frame, [84, 120], [20, -20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Card entrances
  const leftCard = spring({ frame: frame - 12, fps, config: { damping: 13, stiffness: 80 } });
  const rightCard = spring({ frame: frame - 20, fps, config: { damping: 13, stiffness: 80 } });

  // Quiz checkbox burst
  const quizPulse = frame >= 40 && frame <= 72
    ? interpolate(Math.sin((frame - 40) * 0.12), [-1, 1], [0.85, 1.05])
    : 1;

  // Graph line draw
  const lineDraw = interpolate(frame, [64, 96], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill>
      <GradientMeshBg colors={['#f3f4f6', '#ffffff', '#3490dc', '#dbeafe']} intensity={0.5} />
      <Particles count={18} color="rgba(52,144,220,0.2)" />
      <OrbitRing size={140} style={{ position: 'absolute', left: 180, top: 200 }} speed={0.2} />

      <AbsoluteFill style={{ transform: `translateX(${cameraX}px)` }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 36,
          }}
        >
          {/* Headline */}
          <WordByWord
            text="Learn. Practice. Visualize."
            startFrame={0}
            staggerFrames={4}
            fontSize={42}
            color={COLORS.textBlack}
            fontWeight={500}
          />

          {/* Two cards */}
          <div style={{ display: 'flex', gap: 32 }}>
            {/* Quizzes */}
            <div
              style={{
                transform: `translateY(${interpolate(leftCard, [0, 1], [70, 0])}px) rotate(${interpolate(leftCard, [0, 1], [2, 0])}deg) scale(${quizPulse})`,
                opacity: interpolate(leftCard, [0, 1], [0, 1]),
              }}
            >
              <FeatureCard
                title="Custom Interactive Quizzes"
                description="Test your understanding with AI-generated quizzes tailored to your learning level."
                style={{ width: 360, padding: 32 }}
              />
              {/* Mini checkbox burst */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingBottom: 16 }}>
                {['✓', '✓', '✓'].map((c, i) => {
                  const s = spring({ frame: frame - (40 + i * 6), fps, config: { damping: 10, stiffness: 150 } });
                  return (
                    <div
                      key={i}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: COLORS.bluePrimary20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        color: COLORS.bluePrimary,
                        fontWeight: 700,
                        transform: `scale(${s})`,
                        opacity: s,
                      }}
                    >
                      {c}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Graphing */}
            <div
              style={{
                transform: `translateY(${interpolate(rightCard, [0, 1], [70, 0])}px) rotate(${interpolate(rightCard, [0, 1], [-2, 0])}deg)`,
                opacity: interpolate(rightCard, [0, 1], [0, 1]),
              }}
            >
              <FeatureCard
                title="MathGPT Graphing Software"
                description="Visualize equations and functions with interactive, AI-powered graphing tools."
                style={{ width: 360, padding: 32 }}
              />
              {/* Mini graph line */}
              <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 16 }}>
                <svg width="200" height="60" viewBox="0 0 200 60">
                  <path
                    d="M 10 50 Q 50 10, 100 30 Q 150 50, 190 15"
                    fill="none"
                    stroke={COLORS.bluePrimary}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="300"
                    strokeDashoffset={300 - lineDraw * 3}
                  />
                  {/* Grid lines */}
                  {[0, 1, 2, 3].map((i) => (
                    <line
                      key={i}
                      x1={10}
                      y1={15 + i * 12}
                      x2={190}
                      y2={15 + i * 12}
                      stroke="rgba(52,144,220,0.08)"
                      strokeWidth="1"
                    />
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
