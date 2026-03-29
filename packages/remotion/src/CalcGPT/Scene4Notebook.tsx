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

const { fontFamily: interFamily } = loadInter();

const STEPS = [
  { label: 'Step 1', content: 'Find ∫(x² + 3x) dx', note: 'Apply power rule to each term' },
  { label: 'Step 2', content: 'x³/3 + 3x²/2 + C', note: 'Integrate term by term' },
  { label: 'Step 3', content: 'Verify by differentiating', note: 'd/dx(x³/3 + 3x²/2) = x² + 3x ✓' },
  { label: 'Step 4', content: 'Final answer confirmed', note: 'Solution: x³/3 + 3x²/2 + C' },
];

const NotebookStep: React.FC<{
  step: typeof STEPS[0];
  delay: number;
  highlightProgress: number;
}> = ({ step, delay, highlightProgress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 80 } });
  const y = interpolate(s, [0, 1], [18, 0]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  return (
    <div
      style={{
        transform: `translateY(${y}px)`,
        opacity,
        marginBottom: 18,
        padding: '14px 18px',
        borderRadius: 10,
        background: `rgba(139,92,246,${highlightProgress * 0.08})`,
        border: `1px solid rgba(139,92,246,${highlightProgress * 0.3 + 0.05})`,
        transition: 'none',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: PALETTE.accentPurple,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}
      >
        {step.label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, color: '#333', marginBottom: 4 }}>
        {step.content}
      </div>
      <div style={{ fontSize: 13, color: '#666' }}>{step.note}</div>
    </div>
  );
};

export const Scene4Notebook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Zoom in effect at start
  const zoomScale = interpolate(frame, [0, 20], [1, 2.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const zoomSettled = interpolate(frame, [20, 40], [2.1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const effectiveZoom = frame < 20 ? zoomScale : frame < 40 ? zoomSettled : 1;

  // Camera push
  const camPush = interpolate(frame, [60, 140], [1.0, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Card float
  const cardFloat = Math.sin(frame * 0.025) * 4;

  // Title
  const titleS = spring({ frame: frame - 12, fps, config: { damping: 18, stiffness: 80 } });
  const titleX = interpolate(titleS, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleS, [0, 1], [0, 1]);

  // Glass label
  const glassS = spring({ frame: frame - 60, fps, config: { damping: 18, stiffness: 80 } });
  const glassX = interpolate(glassS, [0, 1], [-40, 0]);
  const glassOpacity = interpolate(glassS, [0, 1], [0, 1]);

  // Highlight sweep for notebook steps (cycles through steps)
  const getHighlight = (idx: number) => {
    const start = 42 + idx * 25;
    const progress = interpolate(frame, [start, start + 20], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const fade = interpolate(frame, [start + 20, start + 45], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return progress * fade;
  };

  // Exit
  const exitOpacity = interpolate(frame, [210, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  // Ring
  const ringRot = frame * 0.3;

  return (
    <AbsoluteFill style={{ background: PALETTE.bgPrimary, opacity: exitOpacity }}>
      <GradientMesh
        colors={['#8b5cf6', '#3b82f6', '#f97316', '#1a1a1a']}
        baseColor={PALETTE.bgPrimary}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={10} colors={['rgba(139,92,246,0.4)', 'rgba(59,130,246,0.35)', 'rgba(249,115,22,0.25)']} />
      </AbsoluteFill>

      {/* Dashed ring */}
      <div
        style={{
          position: 'absolute',
          right: '8%',
          top: '50%',
          transform: `translateY(-50%) rotate(${ringRot}deg)`,
          pointerEvents: 'none',
        }}
      >
        <svg width="400" height="400">
          <circle
            cx="200"
            cy="200"
            r="190"
            fill="none"
            stroke="rgba(139,92,246,0.1)"
            strokeWidth="1"
            strokeDasharray="8 14"
          />
        </svg>
      </div>

      {/* Bokeh orbs */}
      <div
        style={{
          position: 'absolute',
          left: '5%',
          top: '30%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          transform: `translateY(${Math.sin(frame * 0.01) * 15}px)`,
        }}
      />

      {/* Main content - camera push */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${camPush * effectiveZoom})`,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Feature card */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'flex-start',
            transform: `translateY(${cardFloat}px)`,
          }}
        >
          {/* Notebook card */}
          <div
            style={{
              background: PALETTE.bgSurfaceElevated,
              border: `1px solid ${PALETTE.borderPrimary}`,
              borderRadius: 28,
              padding: 24,
              width: 580,
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Card header */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: PALETTE.accentPurple,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
                fontFamily: interFamily,
              }}
            >
              Notebook View
            </div>

            {/* Paper panel */}
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                color: '#333',
                fontFamily: interFamily,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1a1a1a',
                  marginBottom: 16,
                  borderBottom: '1px solid #e5e5e5',
                  paddingBottom: 10,
                }}
              >
                Problem: Evaluate ∫(x² + 3x) dx
              </div>
              {STEPS.map((step, i) => (
                <NotebookStep
                  key={i}
                  step={step}
                  delay={26 + i * 10}
                  highlightProgress={getHighlight(i)}
                />
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ width: 360, fontFamily: interFamily }}
          >
            {/* Title */}
            <div
              style={{
                transform: `translateX(${titleX}px)`,
                opacity: titleOpacity,
              }}
            >
              <h2
                style={{
                  fontSize: 44,
                  fontWeight: 700,
                  color: PALETTE.textPrimary,
                  lineHeight: 1.15,
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                Understand the{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #8A6BF2, #3B82F6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  why.
                </span>
              </h2>
              <p style={{ fontSize: 18, color: PALETTE.textSecondary, lineHeight: 1.6, margin: 0 }}>
                Solutions explained, line-by-line. Not just answers—real understanding.
              </p>
            </div>

            {/* Callout chip */}
            <div
              style={{
                marginTop: 28,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 20px',
                background: 'rgba(139,92,246,0.12)',
                border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: 40,
                fontSize: 15,
                fontWeight: 600,
                color: PALETTE.accentPurple,
                opacity: titleOpacity,
              }}
            >
              <span>📖</span>
              <span>Step-by-step understanding</span>
            </div>
          </div>
        </div>
      </div>

      {/* Glass label */}
      <div
        style={{
          position: 'absolute',
          left: '3%',
          bottom: '12%',
          transform: `translateX(${glassX}px)`,
          opacity: glassOpacity,
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          padding: '12px 20px',
          fontFamily: interFamily,
          pointerEvents: 'none',
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: PALETTE.textPrimary }}>
          Notebook View
        </div>
        <div style={{ fontSize: 12, color: PALETTE.textSecondary }}>AI-guided math steps</div>
      </div>
    </AbsoluteFill>
  );
};
