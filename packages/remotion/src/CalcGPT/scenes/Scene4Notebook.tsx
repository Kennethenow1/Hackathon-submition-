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
import { COLORS } from '../constants';

const { fontFamily: inter } = loadInter();

const STEPS = [
  { num: '1', desc: 'Identify the equation type', math: '2x² + 3x - 5 = 0' },
  { num: '2', desc: 'Apply the quadratic formula', math: 'x = (-b ± √(b²-4ac)) / 2a' },
  { num: '3', desc: 'Calculate the discriminant', math: 'Δ = 9 + 40 = 49' },
];

export const Scene4Notebook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Carry-over zoom from previous scene
  const entryZoom = interpolate(frame, [0, 28], [2.0, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const entryOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Camera push-in during hold
  const camPush = interpolate(frame, [68, 140], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Glassmorphism callout
  const calloutSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 18, stiffness: 80 },
  });
  const calloutX = interpolate(calloutSpring, [0, 1], [60, 0]);

  // Exit
  const exitOpacity = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [160, 180], [1, 0.96], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <GradientMesh
        colors={[
          COLORS.bgSurface,
          COLORS.accentPurple,
          COLORS.accentBlue,
          COLORS.bgPrimary,
        ]}
      />
      <Particles count={12} colors={[COLORS.accentBlue, COLORS.accentPurple]} opacity={0.25} />

      <AbsoluteFill
        style={{
          transform: `scale(${entryZoom * camPush * exitScale})`,
          opacity: entryOpacity * exitOpacity,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Feature card */}
        <div
          style={{
            width: 900,
            background: COLORS.bgSurfaceElevated,
            border: `1px solid ${COLORS.borderPrimary}`,
            borderRadius: 28,
            padding: 24,
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            position: 'relative',
          }}
        >
          {/* Card header */}
          <div
            style={{
              fontFamily: inter,
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.textPrimary,
              marginBottom: 16,
            }}
          >
            📓 Notebook View
          </div>

          {/* Preview area */}
          <div
            style={{
              background: COLORS.bgPrimary,
              borderRadius: 20,
              padding: 24,
              display: 'flex',
              gap: 16,
            }}
          >
            {/* Whiteboard */}
            <div
              style={{
                flex: 1,
                background: '#111',
                borderRadius: 12,
                padding: 16,
                minHeight: 260,
              }}
            >
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 13,
                  color: COLORS.textMuted,
                  marginBottom: 12,
                }}
              >
                Problem:
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 20,
                  fontWeight: 700,
                  color: COLORS.textPrimary,
                }}
              >
                Solve 2x² + 3x - 5 = 0
              </div>
            </div>

            {/* Steps notebook */}
            <div
              style={{
                flex: 1.2,
                background: '#fff',
                borderRadius: 12,
                padding: 16,
                color: '#333',
              }}
            >
              <div
                style={{
                  fontFamily: "'Times New Roman', serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#111',
                  marginBottom: 14,
                }}
              >
                Step-by-step solution
              </div>
              {STEPS.map((step, i) => {
                const delay = 28 + i * 14;
                const s = spring({
                  frame: frame - delay,
                  fps,
                  config: { damping: 18, stiffness: 100 },
                });
                const y = interpolate(s, [0, 1], [18, 0]);
                return (
                  <div
                    key={i}
                    style={{
                      opacity: s,
                      transform: `translateY(${y}px)`,
                      marginBottom: 14,
                      paddingBottom: 12,
                      borderBottom: i < STEPS.length - 1 ? '1px solid #eee' : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: inter,
                        fontSize: 12,
                        color: '#555',
                        marginBottom: 4,
                      }}
                    >
                      Step {step.num}: {step.desc}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Times New Roman', serif",
                        fontSize: 17,
                        fontWeight: 700,
                        color: '#111',
                      }}
                    >
                      {step.math}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA button */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <div
              style={{
                padding: '10px 20px',
                borderRadius: 16,
                border: `1px solid ${COLORS.borderSecondary}`,
                background: COLORS.bgSurface,
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 500,
                color: COLORS.textPrimary,
              }}
            >
              Try Notebook View →
            </div>
          </div>
        </div>

        {/* Glassmorphism callout */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 160,
            padding: '18px 26px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            opacity: calloutSpring,
            transform: `translateX(${calloutX}px)`,
            maxWidth: 240,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 15,
              fontWeight: 600,
              color: COLORS.textPrimary,
              marginBottom: 6,
            }}
          >
            Notebook View
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 12,
              color: COLORS.textSecondary,
              lineHeight: 1.5,
            }}
          >
            See the logic behind every answer, not just the result.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
