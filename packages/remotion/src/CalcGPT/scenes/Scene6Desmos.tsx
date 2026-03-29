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
import { COLORS } from '../constants';

const { fontFamily: inter } = loadInter();

export const Scene6Desmos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card reveal wipe
  const wipeProgress = interpolate(frame, [0, 26], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Prompt chips
  const prompt3dSpring = spring({ frame: frame - 14, fps, config: { damping: 14, stiffness: 120 } });
  const prompt2dSpring = spring({ frame: frame - 22, fps, config: { damping: 14, stiffness: 120 } });

  // 3D surface rotation
  const surfaceRotY = interpolate(frame, [32, 88], [0, 25], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const surfaceRotX = interpolate(frame, [32, 88], [-15, -5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Tangent highlight glow
  const tangentGlow = interpolate(frame, [56, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit
  const exitOpacity = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <GradientMesh
        colors={[
          COLORS.accentBlue,
          COLORS.accentPurple,
          COLORS.bgSurface,
          COLORS.bgPrimary,
        ]}
      />
      <Particles count={16} colors={[COLORS.accentBlue, COLORS.accentPurple]} opacity={0.2} />
      <OrbitRing size={480} speed={0.18} />
      <OrbitRing size={360} speed={-0.25} dashArray="4 8" />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 940,
            clipPath: `inset(0 ${100 - wipeProgress}% 0 0)`,
          }}
        >
          <div
            style={{
              background: COLORS.bgSurfaceElevated,
              borderRadius: 28,
              padding: 24,
              border: `1px solid ${COLORS.borderPrimary}`,
              boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 18,
                fontWeight: 600,
                color: COLORS.textPrimary,
                marginBottom: 16,
              }}
            >
              📊 Desmos Graphing
            </div>

            <div
              style={{
                background: COLORS.bgPrimary,
                borderRadius: 20,
                padding: 24,
                display: 'flex',
                gap: 16,
              }}
            >
              {/* Left: prompts */}
              <div style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    padding: '10px 14px',
                    background: COLORS.bgSurface,
                    border: `1px solid ${COLORS.borderSecondary}`,
                    borderRadius: 12,
                    fontFamily: inter,
                    fontSize: 12,
                    color: COLORS.textSecondary,
                    opacity: prompt3dSpring,
                    transform: `scale(${interpolate(prompt3dSpring, [0, 1], [0.9, 1])})`,
                  }}
                >
                  🌐 Plot z = sin(x)cos(y)
                </div>
                <div
                  style={{
                    padding: '10px 14px',
                    background: COLORS.bgSurface,
                    border: `1px solid ${COLORS.borderSecondary}`,
                    borderRadius: 12,
                    fontFamily: inter,
                    fontSize: 12,
                    color: COLORS.textSecondary,
                    opacity: prompt2dSpring,
                    transform: `scale(${interpolate(prompt2dSpring, [0, 1], [0.9, 1])})`,
                  }}
                >
                  📈 Show tangent at x=2
                </div>
              </div>

              {/* Right: graphs */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* 3D surface */}
                <div
                  style={{
                    height: 160,
                    background: '#111',
                    borderRadius: 12,
                    overflow: 'hidden',
                    perspective: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      background: `linear-gradient(135deg, ${COLORS.accentBlue}66, ${COLORS.accentPurple}66)`,
                      borderRadius: 8,
                      transform: `rotateX(${surfaceRotX}deg) rotateY(${surfaceRotY}deg)`,
                      border: `1px solid ${COLORS.accentBlue}44`,
                    }}
                  />
                </div>

                {/* 2D graph with tangent */}
                <div
                  style={{
                    height: 140,
                    background: '#111',
                    borderRadius: 12,
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 16,
                  }}
                >
                  {/* Axes */}
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 500 120"
                    style={{ position: 'absolute', inset: 0 }}
                  >
                    {/* Axis lines */}
                    <line
                      x1="40"
                      y1="100"
                      x2="480"
                      y2="100"
                      stroke="#444"
                      strokeWidth="1"
                    />
                    <line
                      x1="40"
                      y1="10"
                      x2="40"
                      y2="100"
                      stroke="#444"
                      strokeWidth="1"
                    />
                    {/* Curve */}
                    <path
                      d="M40,80 Q120,20 200,50 T360,30 T480,60"
                      fill="none"
                      stroke={COLORS.accentBlue}
                      strokeWidth="2.5"
                    />
                    {/* Tangent line */}
                    <line
                      x1="160"
                      y1="70"
                      x2="280"
                      y2="20"
                      stroke={COLORS.accentPink}
                      strokeWidth="2"
                      opacity={tangentGlow}
                      filter="url(#glow)"
                    />
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Glassmorphism callout */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: '35%',
            padding: '16px 24px',
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16,
            opacity: tangentGlow,
            transform: `translateX(${interpolate(tangentGlow, [0, 1], [40, 0])}px)`,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ fontFamily: inter, fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}>
            See the concept
          </div>
          <div style={{ fontFamily: inter, fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>
            2D & 3D visualization built in
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
