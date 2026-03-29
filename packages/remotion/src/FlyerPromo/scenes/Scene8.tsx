import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { COLORS } from '../constants';
import { FONT_FAMILY } from '../fonts';
import { GradientBg } from '../utils/GradientBg';
import { Particles } from '../utils/Particles';
import { LensFlare } from '../utils/LensFlare';

export const SCENE8_DURATION = 180;

const steps = [
  { icon: '📄', label: 'Drop your image\nor PDF here', accent: false },
  { icon: '📷', label: 'Take a Photo', accent: false },
  { icon: '🔍', label: 'Process Photo', accent: true },
  { icon: '✓', label: 'Event added\nto calendar', accent: false },
];

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera pan
  const panX = interpolate(frame, [50, 140], [40, -40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Caption
  const capEnter = spring({ frame, fps, delay: 34, config: { damping: 200 } });
  const capY = interpolate(capEnter, [0, 1], [20, 0], { extrapolateRight: 'clamp' });

  // Sparkle on last card
  const sparkle = frame >= 96 && frame <= 112
    ? interpolate(Math.sin((frame - 96) * 0.4), [-1, 1], [0.3, 1])
    : 0;

  const exitOp = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <GradientBg colors={[COLORS.offWhite, COLORS.white, COLORS.subtleBlue, COLORS.lightGray]} />
      <Particles count={12} color="rgba(74,143,231,0.1)" />
      <LensFlare x={85} y={40} size={180} />
      <LensFlare x={15} y={70} size={160} color="rgba(200,210,230,0.18)" />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateX(${panX}px)`,
          opacity: exitOp,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {steps.map((step, i) => {
            const enter = spring({ frame, fps, delay: i * 6, config: { damping: 18, stiffness: 80 } });
            const ty = interpolate(enter, [0, 1], [50, 0], { extrapolateRight: 'clamp' });
            const floatY = frame > 48 ? Math.sin((frame - 48) * 0.04 + i * 1.5) * 6 : 0;
            const isLast = i === steps.length - 1;

            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    width: 220,
                    padding: '28px 18px',
                    background: step.accent
                      ? `linear-gradient(135deg, ${COLORS.accentBlue}, ${COLORS.subtleBlue})`
                      : COLORS.white,
                    borderRadius: 18,
                    boxShadow: '0 10px 32px rgba(0,0,0,0.08)',
                    textAlign: 'center' as const,
                    fontFamily: FONT_FAMILY,
                    opacity: enter,
                    transform: `translateY(${ty + floatY}px)`,
                    position: 'relative' as const,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{step.icon}</div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: step.accent ? '#fff' : COLORS.charcoal,
                      whiteSpace: 'pre-line' as const,
                      lineHeight: 1.4,
                    }}
                  >
                    {step.label}
                  </div>
                  {isLast && sparkle > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: `rgba(52,199,89,${sparkle * 0.6})`,
                        boxShadow: `0 0 12px rgba(52,199,89,${sparkle * 0.4})`,
                      }}
                    />
                  )}
                </div>
                {/* Arrow */}
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="28"
                      height="16"
                      viewBox="0 0 28 16"
                      fill="none"
                      style={{
                        opacity: interpolate(
                          spring({ frame, fps, delay: 18 + i * 6, config: { damping: 200 } }),
                          [0, 1],
                          [0, 0.6]
                        ),
                      }}
                    >
                      <path d="M0 8H24M24 8L18 2M24 8L18 14" stroke={COLORS.midGray} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Caption */}
        <div
          style={{
            opacity: capEnter,
            transform: `translateY(${capY}px)`,
            fontSize: 18,
            fontWeight: 400,
            color: COLORS.charcoal,
            fontFamily: FONT_FAMILY,
            textAlign: 'center' as const,
          }}
        >
          One focused workflow—fast, clean, and easy to use.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
