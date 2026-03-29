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

const TESTIMONIALS = [
  {
    quote: "CalcGPT actually explains the why, not just the what. My grade went from a C to an A.",
    name: 'Alex M.',
    subject: 'Calculus II',
    stars: 5,
  },
  {
    quote: "The Check Work feature caught mistakes I didn't even know I was making. Game changer.",
    name: 'Sarah K.',
    subject: 'Differential Equations',
    stars: 5,
  },
  {
    quote: "I passed my final because CalcGPT helped me actually understand integration. Thank you!",
    name: 'James T.',
    subject: 'Calculus I',
    stars: 5,
  },
];

const MetricCounter: React.FC<{ targetValue: number; suffix?: string; delay?: number }> = ({
  targetValue,
  suffix = '',
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 40 } });
  const displayValue = Math.round(interpolate(progress, [0, 1], [0, targetValue]));
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

const TestimonialCard: React.FC<{
  testimonial: typeof TESTIMONIALS[0];
  delay: number;
  isFocused: boolean;
}> = ({ testimonial, delay, isFocused }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 70 } });
  const y = interpolate(s, [0, 1], [40, 0]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  const focusScale = isFocused ? 1.04 : 0.96;
  const focusOpacity = isFocused ? 1 : 0.6;

  return (
    <div
      style={{
        transform: `translateY(${y}px) scale(${focusScale})`,
        opacity: opacity * focusOpacity,
        background: 'rgba(26,26,26,0.8)',
        border: `1px solid ${PALETTE.borderPrimary}`,
        borderRadius: 20,
        padding: 28,
        width: 380,
        flexShrink: 0,
        backdropFilter: 'blur(10px)',
        boxShadow: isFocused ? '0 16px 48px rgba(0,0,0,0.4)' : 'none',
        transition: 'none',
      }}
    >
      {/* Stars */}
      <div style={{ fontSize: 18, color: '#fbbf24', marginBottom: 12 }}>
        {'★'.repeat(testimonial.stars)}
      </div>
      {/* Quote */}
      <div
        style={{
          fontSize: 16,
          color: PALETTE.textSecondary,
          lineHeight: 1.6,
          fontStyle: 'italic',
          marginBottom: 16,
          fontFamily: interFamily,
        }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </div>
      {/* Attribution */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: PALETTE.textPrimary,
          fontFamily: interFamily,
        }}
      >
        {testimonial.name}
        <span style={{ color: PALETTE.textMuted, fontWeight: 400 }}> · {testimonial.subject}</span>
      </div>
    </div>
  );
};

export const Scene8Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Metric entrance
  const metricS = spring({ frame: frame - 0, fps, config: { damping: 20, stiffness: 60 } });
  const metricScale = interpolate(metricS, [0, 1], [0.9, 1]);
  const metricOpacity = interpolate(metricS, [0, 1], [0, 1]);

  // Subline
  const sublineOpacity = interpolate(frame, [14, 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const sublineY = interpolate(frame, [14, 42], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Carousel focus
  const carouselFocus =
    frame < 70 ? 0 :
    frame < 110 ? 1 :
    frame < 150 ? 2 : 1;

  // Confidence line progress
  const progressWidth = interpolate(frame, [110, 178], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Quote shimmer
  const shimmerX = interpolate(frame, [150, 210], [-200, 600], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Exit
  const exitOpacity = interpolate(frame, [210, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill style={{ background: PALETTE.bgPrimary, opacity: exitOpacity }}>
      <GradientMesh
        colors={['#1a1a1a', '#8b5cf6', '#3b82f6', '#0a0a0a']}
        baseColor={PALETTE.bgPrimary}
      />

      {/* Floating stars decoration */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 25}%`,
              fontSize: 18,
              opacity: 0.04 + (i % 3) * 0.02,
              color: '#fbbf24',
              transform: `rotate(${i * 15}deg) translateY(${Math.sin(frame * 0.02 + i) * 8}px)`,
            }}
          >
            ★
          </div>
        ))}
      </div>

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles
          count={18}
          colors={['rgba(139,92,246,0.4)', 'rgba(59,130,246,0.35)', 'rgba(251,191,36,0.2)']}
        />
      </AbsoluteFill>

      {/* Light streaks */}
      <div
        style={{
          position: 'absolute',
          left: '20%',
          top: '40%',
          width: 400,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)',
          transform: `rotate(-15deg) translateY(${Math.sin(frame * 0.02) * 20}px)`,
          pointerEvents: 'none',
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        {/* Metric counter */}
        <div
          style={{
            transform: `scale(${metricScale})`,
            opacity: metricOpacity,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: interFamily,
              fontSize: 88,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #8A6BF2, #3B82F6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}
          >
            <MetricCounter targetValue={800000} suffix="+" />
          </div>
        </div>

        {/* Subline */}
        <div
          style={{
            fontFamily: interFamily,
            fontSize: 22,
            color: PALETTE.textSecondary,
            marginBottom: 40,
            opacity: sublineOpacity,
            transform: `translateY(${sublineY}px)`,
          }}
        >
          students rely on CalcGPT
        </div>

        {/* Testimonial carousel */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 48,
            overflow: 'visible',
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <TestimonialCard
              key={i}
              testimonial={t}
              delay={36 + i * 8}
              isFocused={carouselFocus === i}
            />
          ))}
        </div>

        {/* Confidence headline */}
        <div
          style={{
            textAlign: 'center',
            maxWidth: 800,
            fontFamily: interFamily,
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: PALETTE.textPrimary,
              lineHeight: 1.2,
              marginBottom: 20,
              background: `linear-gradient(90deg, ${PALETTE.textPrimary} 0%, ${PALETTE.accentPurple} ${shimmerX / 8}%, ${PALETTE.textPrimary} ${shimmerX / 4}%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <WordByWord
              text='Walk into your math exam with total confidence.'
              startFrame={110}
              gapFrames={4}
              highlightWords={['confidence.']}
              highlightColor={PALETTE.accentPurple}
            />
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: 500,
              height: 8,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 4,
              overflow: 'hidden',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: `${progressWidth}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                borderRadius: 4,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: PALETTE.textMuted,
              fontFamily: interFamily,
            }}
          >
            Student confidence improvement
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
