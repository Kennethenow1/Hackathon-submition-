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

export const Scene9Trust: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Metric counter
  const counterProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 40 },
  });
  const metricValue = Math.round(interpolate(counterProgress, [0, 1], [0, 800000]));
  const formatted = metricValue.toLocaleString();

  // Quote card entrance
  const quoteSpring = spring({
    frame: frame - 16,
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const quoteScale = interpolate(quoteSpring, [0, 1], [0.94, 1]);

  // Testimonial snippets
  const test1Spring = spring({ frame: frame - 38, fps, config: { damping: 16, stiffness: 90 } });
  const test2Spring = spring({ frame: frame - 50, fps, config: { damping: 16, stiffness: 90 } });

  // Camera push
  const camPush = interpolate(frame, [60, 90], [1, 1.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Exit
  const exitOpacity = interpolate(frame, [72, 90], [1, 0], {
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
      <Particles count={14} colors={[COLORS.accentPink, COLORS.accentOrange]} opacity={0.2} />

      <AbsoluteFill
        style={{
          transform: `scale(${camPush})`,
          opacity: exitOpacity,
          display: 'flex',
          padding: '0 100px',
          alignItems: 'center',
          gap: 60,
        }}
      >
        {/* Left: metrics */}
        <div style={{ flex: 1 }}>
          {/* Main counter */}
          <div
            style={{
              opacity: counterProgress,
              transform: `translateY(${interpolate(counterProgress, [0, 1], [30, 0])}px)`,
            }}
          >
            <div
              style={{
                fontFamily: inter,
                fontSize: 64,
                fontWeight: 700,
                color: COLORS.textPrimary,
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {formatted}+
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 16,
                color: COLORS.textSecondary,
              }}
            >
              students rely on CalcGPT
            </div>
          </div>

          {/* Small chips */}
          {[
            { label: 'Step-by-step breakdowns', delay: 20 },
            { label: 'Instant mistake feedback', delay: 28 },
          ].map((chip, i) => {
            const s = spring({
              frame: frame - chip.delay,
              fps,
              config: { damping: 16, stiffness: 100 },
            });
            return (
              <div
                key={i}
                style={{
                  marginTop: 16,
                  padding: '10px 16px',
                  background: COLORS.bgSurfaceElevated,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 12,
                  fontFamily: inter,
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                  display: 'inline-block',
                }}
              >
                ✓ {chip.label}
              </div>
            );
          })}
        </div>

        {/* Right: quote card */}
        <div style={{ flex: 1.2 }}>
          <div
            style={{
              background: COLORS.bgSurfaceElevated,
              border: `1px solid ${COLORS.borderPrimary}`,
              borderRadius: 24,
              padding: 32,
              opacity: quoteSpring,
              transform: `scale(${quoteScale})`,
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            {/* Decorative quote mark */}
            <div
              style={{
                position: 'absolute',
                top: -10,
                left: 20,
                fontSize: 80,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${COLORS.gradientTextStart}, ${COLORS.gradientTextEnd})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: 0.12,
                lineHeight: 1,
              }}
            >
              "
            </div>

            <div
              style={{
                fontFamily: inter,
                fontSize: 22,
                fontWeight: 500,
                color: COLORS.textPrimary,
                lineHeight: 1.6,
                marginBottom: 16,
              }}
            >
              Walk into your math exam with total confidence.
            </div>
            <div
              style={{
                fontFamily: inter,
                fontSize: 14,
                color: COLORS.textSecondary,
              }}
            >
              — CalcGPT Student
            </div>
          </div>

          {/* Testimonial snippets */}
          {[
            { text: '"Finally understand calculus!"', s: test1Spring },
            { text: '"Went from C to A in 3 weeks"', s: test2Spring },
          ].map((t, i) => (
            <div
              key={i}
              style={{
                marginTop: 12,
                padding: '10px 16px',
                background: COLORS.bgSurface,
                border: `1px solid ${COLORS.borderPrimary}`,
                borderRadius: 14,
                fontFamily: inter,
                fontSize: 13,
                color: COLORS.textSecondary,
                opacity: t.s,
                transform: `translateY(${interpolate(t.s, [0, 1], [14, 0])}px)`,
              }}
            >
              {t.text}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
