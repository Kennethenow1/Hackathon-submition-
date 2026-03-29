import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { loadFont as loadRaleway } from '@remotion/google-fonts/Raleway';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { GradientMesh } from '../helpers/GradientMesh';
import { Particles } from '../helpers/Particles';
import { OrbitRing } from '../helpers/OrbitRing';
import { LensFlare } from '../helpers/LensFlare';
import { COLORS } from '../constants';

const { fontFamily: raleway } = loadRaleway();
const { fontFamily: inter } = loadInter();

const HEADLINE = 'This AI makes you better at math';

export const Scene1Hero: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background entrance
  const bgOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const bgScale = interpolate(frame, [0, 18], [1.03, 1.0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Camera push-in during hold
  const cameraPush = interpolate(frame, [32, 120], [1.0, 1.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Exit
  const exitScale = interpolate(frame, [96, 120], [1, 0.985], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(frame, [102, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Word-by-word headline
  const words = HEADLINE.split(' ');

  // Subheadline
  const subOpacity = interpolate(frame, [20, 44], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subY = interpolate(frame, [20, 44], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Floating UI fragments
  const fragments = [
    { x: '12%', y: '18%', rotate: -6, delay: 22 },
    { x: '82%', y: '22%', rotate: 4, delay: 30 },
    { x: '76%', y: '72%', rotate: -3, delay: 38 },
  ];

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: bgOpacity,
          transform: `scale(${bgScale * cameraPush})`,
        }}
      >
        <GradientMesh
          colors={[
            COLORS.accentPurple,
            COLORS.accentBlue,
            COLORS.bgSurface,
            COLORS.bgPrimary,
          ]}
        />
      </div>

      <Particles
        count={18}
        colors={[COLORS.accentPurple, COLORS.accentBlue, COLORS.accentPink]}
      />
      <LensFlare x={72} y={26} size={500} color={COLORS.accentPurple} />
      <OrbitRing
        size={520}
        speed={0.15}
        color="rgba(139,92,246,0.08)"
        dashArray="6 16"
      />

      {/* Floating UI fragments */}
      {fragments.map((frag, i) => {
        const fragSpring = spring({
          frame: frame - frag.delay,
          fps,
          config: { damping: 18, stiffness: 80 },
        });
        const fragScale = interpolate(fragSpring, [0, 1], [0.9, 1]);
        const fragRot = interpolate(fragSpring, [0, 1], [frag.rotate, 0]);
        const fragFloat = Math.sin(frame * 0.015 + i * 2) * 8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: frag.x,
              top: frag.y,
              width: 140,
              height: 80,
              borderRadius: 16,
              background: COLORS.bgSurfaceElevated,
              border: `1px solid ${COLORS.borderPrimary}`,
              transform: `scale(${fragScale}) rotate(${fragRot}deg) translateY(${fragFloat}px)`,
              opacity: fragSpring * 0.6,
              filter: 'blur(1px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: '60%',
                height: 8,
                borderRadius: 4,
                background: COLORS.borderPrimary,
                margin: '14px 14px 8px',
              }}
            />
            <div
              style={{
                width: '40%',
                height: 6,
                borderRadius: 3,
                background: COLORS.borderPrimary,
                margin: '0 14px',
              }}
            />
          </div>
        );
      })}

      {/* Main content */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${exitScale})`,
          opacity: exitOpacity,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 1100, padding: '0 40px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 28,
            }}
          >
            {words.map((word, i) => {
              const delay = 4 + i * 4;
              const s = spring({
                frame: frame - delay,
                fps,
                config: { damping: 14, stiffness: 120 },
              });
              const y = interpolate(s, [0, 1], [44, 0]);
              const o = interpolate(s, [0, 1], [0, 1]);

              // Gradient text for 'AI'
              const isGradientWord = word === 'AI';
              const highlightProgress = interpolate(
                frame,
                [14, 34],
                [0, 100],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
              );

              return (
                <span
                  key={i}
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${y}px)`,
                    opacity: o,
                    fontFamily: raleway,
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    fontWeight: 500,
                    lineHeight: 1.1,
                    color: COLORS.textPrimary,
                    ...(isGradientWord
                      ? {
                          background: `linear-gradient(135deg, ${COLORS.gradientTextStart}, ${COLORS.gradientTextEnd})`,
                          backgroundSize: '200% 100%',
                          backgroundPosition: `${highlightProgress}% 0`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }
                      : {}),
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>

          <div
            style={{
              opacity: subOpacity,
              transform: `translateY(${subY}px)`,
              fontFamily: inter,
              fontSize: '1.125rem',
              color: COLORS.textSecondary,
              lineHeight: 1.6,
            }}
          >
            Stop guessing. Start understanding. CalcGPT walks you through
            every step.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
