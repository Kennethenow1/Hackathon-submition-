import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { GradientMesh } from '../helpers/GradientMesh';
import { Particles } from '../helpers/Particles';
import { OrbitRing } from '../helpers/OrbitRing';
import { LensFlare } from '../helpers/LensFlare';
import { COLORS } from '../constants';

const { fontFamily: inter } = loadInter();

const TOOLS = [
  { icon: '📝', name: 'Practice Quizzes', desc: 'Adaptive questions' },
  { icon: '🗂️', name: 'Flashcards', desc: 'Spaced repetition' },
  { icon: '📅', name: 'Course Scheduler', desc: 'Plan your study' },
  { icon: '📊', name: 'Practice Tests', desc: 'Exam simulation' },
];

export const Scene8LearningTools: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera micro-pushes per quadrant
  const focusPhase = Math.floor(interpolate(frame, [30, 120], [0, 3.99], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));

  // Progress bar fill for practice test
  const progressFill = interpolate(frame, [120, 144], [15, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Overlay headline
  const headlineOpacity = interpolate(frame, [138, 150], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit
  const exitOpacity = interpolate(frame, [138, 150], [1, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <GradientMesh
        colors={[
          COLORS.bgPrimary,
          COLORS.bgSurface,
          COLORS.accentPink,
          COLORS.accentOrange,
        ]}
      />
      <Particles count={20} colors={[COLORS.accentPink, COLORS.accentOrange, COLORS.accentBlue]} opacity={0.2} />
      <OrbitRing size={500} speed={0.15} />
      <OrbitRing size={380} speed={-0.2} dashArray="3 10" />
      <LensFlare x={30} y={70} size={300} color={COLORS.accentPink} />

      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          opacity: exitOpacity,
        }}
      >
        {/* 2x2 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            width: 840,
          }}
        >
          {TOOLS.map((tool, i) => {
            const delay = i * 8;
            const s = spring({
              frame: frame - delay,
              fps,
              config: { damping: 16, stiffness: 90 },
            });
            const y = interpolate(s, [0, 1], [40, 0]);
            const isFocused = focusPhase === i;
            const focusScale = isFocused ? 1.04 : 1;
            const floatY = Math.sin(frame * 0.015 + i * 1.5) * 3;

            return (
              <div
                key={i}
                style={{
                  background: COLORS.bgSurfaceElevated,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 28,
                  padding: 24,
                  opacity: s,
                  transform: `translateY(${y + floatY}px) scale(${focusScale})`,
                  transition: 'none',
                  boxShadow: isFocused
                    ? '0 20px 50px rgba(0,0,0,0.4)'
                    : '0 10px 30px rgba(0,0,0,0.25)',
                  minHeight: 180,
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{tool.icon}</div>
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 17,
                    fontWeight: 600,
                    color: COLORS.textPrimary,
                    marginBottom: 6,
                  }}
                >
                  {tool.name}
                </div>
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 13,
                    color: COLORS.textSecondary,
                    marginBottom: 12,
                  }}
                >
                  {tool.desc}
                </div>

                {/* Practice test progress bar */}
                {i === 3 && (
                  <div
                    style={{
                      width: '100%',
                      height: 8,
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.1)',
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        width: `${progressFill}%`,
                        height: '100%',
                        borderRadius: 4,
                        background: '#3578e5',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overlay headline */}
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: inter,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.textPrimary,
            opacity: headlineOpacity,
            textAlign: 'center',
          }}
        >
          From confusion to exam-ready.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
