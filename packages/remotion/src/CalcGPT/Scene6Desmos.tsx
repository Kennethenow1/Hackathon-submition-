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

const PROMPTS = [
  'Plot y = sin(x) from −2π to 2π',
  'Show tangent line at x = π/4',
  'Graph 3D surface z = x² + y²',
];

export const Scene6Desmos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Card entrance
  const cardS = spring({ frame: frame - 0, fps, config: { damping: 20, stiffness: 70 } });
  const cardY = interpolate(cardS, [0, 1], [60, 0]);
  const cardOpacity = interpolate(cardS, [0, 1], [0, 1]);
  const cardRotX = interpolate(cardS, [0, 1], [-6, 0]);
  const cardScale = interpolate(cardS, [0, 1], [0.82, 0.9]);

  // Camera pan
  const camX = interpolate(frame, [72, 120], [0, -80], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const camScale = interpolate(frame, [72, 120], [0.9, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Graph path draw (sin wave)
  const pathProgress = interpolate(frame, [28, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  // Tangent line
  const tangentProgress = interpolate(frame, [55, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.linear),
  });

  // 3D surface rotation
  const surfaceRot = interpolate(frame, [42, 88], [0, 15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  }) + frame * 0.1;

  // Chips
  const chip1S = spring({ frame: frame - 90, fps, config: { damping: 18, stiffness: 80 } });
  const chip1X = interpolate(chip1S, [0, 1], [60, 0]);
  const chip1Opacity = interpolate(chip1S, [0, 1], [0, 1]);

  const chip2S = spring({ frame: frame - 110, fps, config: { damping: 18, stiffness: 80 } });
  const chip2X = interpolate(chip2S, [0, 1], [60, 0]);
  const chip2Opacity = interpolate(chip2S, [0, 1], [0, 1]);

  // Prompt chips entrance
  const promptChips = PROMPTS.map((_, i) => {
    const s = spring({ frame: frame - 16 - i * 8, fps, config: { damping: 18, stiffness: 80 } });
    return {
      y: interpolate(s, [0, 1], [-20, 0]),
      opacity: interpolate(s, [0, 1], [0, 1]),
    };
  });

  // Exit
  const exitOpacity = interpolate(frame, [228, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  // Ring
  const ringRot = -frame * 0.3;

  // Float
  const cardFloat = Math.sin(frame * 0.02) * 4;

  // Generate sin wave SVG path
  const svgWidth = 340;
  const svgHeight = 120;
  const amplitude = 35;
  const frequency = 2;
  const points = Array.from({ length: Math.floor(svgWidth * pathProgress) + 1 }, (_, i) => {
    const x = (i / svgWidth) * 4 * Math.PI - 2 * Math.PI;
    const y = svgHeight / 2 - Math.sin(x * frequency) * amplitude;
    return `${i === 0 ? 'M' : 'L'} ${i} ${y}`;
  }).join(' ');

  return (
    <AbsoluteFill style={{ background: PALETTE.bgPrimary, opacity: exitOpacity }}>
      <GradientMesh
        colors={['#3b82f6', '#8b5cf6', '#1a1a1a', '#0a0a0a']}
        baseColor={PALETTE.bgPrimary}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={20} colors={['rgba(59,130,246,0.5)', 'rgba(139,92,246,0.45)', 'rgba(236,72,153,0.3)']} />
      </AbsoluteFill>

      {/* Technical grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      {/* Orbit ring */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${ringRot}deg)`,
          pointerEvents: 'none',
        }}
      >
        <svg width="800" height="800">
          <circle
            cx="400"
            cy="400"
            r="390"
            fill="none"
            stroke="rgba(59,130,246,0.08)"
            strokeWidth="1"
            strokeDasharray="10 16"
          />
        </svg>
      </div>

      {/* Camera wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translateX(${camX}px) scale(${camScale})`,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Main graph card */}
        <div
          style={{
            transform: `translateY(${cardY + cardFloat}px) scale(${cardScale}) rotateX(${cardRotX}deg)`,
            opacity: cardOpacity,
            background: PALETTE.bgSurfaceElevated,
            border: `1px solid ${PALETTE.borderPrimary}`,
            borderRadius: 28,
            padding: 24,
            width: 520,
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: PALETTE.accentBlue,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 16,
              fontFamily: interFamily,
            }}
          >
            Desmos Integration
          </div>

          {/* Prompt chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {PROMPTS.map((prompt, i) => (
              <div
                key={i}
                style={{
                  transform: `translateY(${promptChips[i]?.y ?? 0}px)`,
                  opacity: promptChips[i]?.opacity ?? 0,
                  padding: '10px 16px',
                  background: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  borderRadius: 12,
                  fontSize: 14,
                  color: PALETTE.textSecondary,
                  fontFamily: interFamily,
                }}
              >
                <span style={{ color: PALETTE.accentBlue, marginRight: 8 }}>→</span>
                {prompt}
              </div>
            ))}
          </div>

          {/* 2D graph */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 12,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ fontSize: 11, color: '#999', marginBottom: 6, fontFamily: interFamily }}>y = sin(x)</div>
            <svg width={svgWidth} height={svgHeight}>
              {/* Grid */}
              <line x1="0" y1={svgHeight / 2} x2={svgWidth} y2={svgHeight / 2} stroke="#e5e7eb" strokeWidth="1" />
              <line x1={svgWidth / 2} y1="0" x2={svgWidth / 2} y2={svgHeight} stroke="#e5e7eb" strokeWidth="1" />
              {/* Sin wave */}
              {pathProgress > 0 && (
                <path d={points} fill="none" stroke={PALETTE.accentBlue} strokeWidth="2.5" />
              )}
              {/* Tangent line */}
              {tangentProgress > 0 && (
                <line
                  x1={svgWidth * 0.5 - 60 * tangentProgress}
                  y1={svgHeight / 2 + 30 * tangentProgress}
                  x2={svgWidth * 0.5 + 60 * tangentProgress}
                  y2={svgHeight / 2 - 30 * tangentProgress}
                  stroke={PALETTE.accentOrange}
                  strokeWidth="2"
                  strokeDasharray={`${4} ${2}`}
                />
              )}
            </svg>
          </div>

          {/* 3D surface hint */}
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: 12,
              fontFamily: interFamily,
              fontSize: 13,
              color: PALETTE.textSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 20 }}>📊</span>
            <span>3D Surface: z = x² + y² · rotating {Math.round(surfaceRot % 360)}°</span>
          </div>
        </div>

        {/* Right side chips */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: interFamily }}>
          <div
            style={{
              transform: `translateX(${chip1X}px)`,
              opacity: chip1Opacity,
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '20px 24px',
              width: 280,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📈</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: PALETTE.textPrimary, marginBottom: 4 }}>Desmos Integration</div>
            <div style={{ fontSize: 13, color: PALETTE.textSecondary }}>Interactive graphing built in</div>
          </div>

          <div
            style={{
              transform: `translateX(${chip2X}px)`,
              opacity: chip2Opacity,
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: '20px 24px',
              width: 280,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔧</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: PALETTE.textPrimary, marginBottom: 4 }}>Built-in Toolkit</div>
            <div style={{ fontSize: 13, color: PALETTE.textSecondary }}>TI-84, whiteboard & more</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
