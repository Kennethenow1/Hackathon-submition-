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

const CARDS = [
  { label: 'Notes App', icon: '📝' },
  { label: 'Graphing Tool', icon: '📈' },
  { label: 'YouTube Tutorial', icon: '▶️' },
  { label: 'Calculator', icon: '🔢' },
];

export const Scene2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Divider wipe
  const dividerWidth = interpolate(frame, [0, 22], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const dividerHeight = interpolate(frame, [0, 22], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Focal text
  const textOpacity = interpolate(frame, [42, 90], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textY = interpolate(frame, [42, 90], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Collapse exit
  const collapseScale = interpolate(frame, [100, 120], [1, 0.92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const collapseOpacity = interpolate(frame, [104, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <GradientMesh
        colors={[
          COLORS.accentPurple,
          COLORS.accentBlue,
          COLORS.bgPrimary,
          COLORS.bgSurface,
        ]}
      />

      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${COLORS.borderPrimary} 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.borderPrimary} 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          opacity: 0.15,
        }}
      />

      <Particles count={10} colors={[COLORS.accentPurple, COLORS.accentBlue]} opacity={0.2} />

      <AbsoluteFill
        style={{
          transform: `scale(${collapseScale})`,
          opacity: collapseOpacity,
        }}
      >
        {/* Left side - scattered cards */}
        <div
          style={{
            position: 'absolute',
            left: 80,
            top: 160,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {CARDS.map((card, i) => {
            const delay = 6 + i * 6;
            const s = spring({
              frame: frame - delay,
              fps,
              config: { damping: 16, stiffness: 100 },
            });
            const y = interpolate(s, [0, 1], [40, 0]);
            const drift = Math.sin(frame * 0.012 + i * 1.5) * 4;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '18px 24px',
                  background: COLORS.bgSurfaceElevated,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 28,
                  opacity: s,
                  transform: `translateY(${y + drift}px)`,
                  width: 320,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}
              >
                <span style={{ fontSize: 28 }}>{card.icon}</span>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 16,
                    fontWeight: 500,
                    color: COLORS.textSecondary,
                  }}
                >
                  {card.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Center divider */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: dividerWidth,
            height: `${dividerHeight}%`,
            background: `linear-gradient(180deg, ${COLORS.accentPurple}44, ${COLORS.accentBlue}44)`,
            borderRadius: 4,
          }}
        />

        {/* Right side - chaotic stack */}
        <div
          style={{
            position: 'absolute',
            right: 100,
            top: 180,
            width: 500,
            height: 500,
          }}
        >
          {[0, 1, 2, 3].map((i) => {
            const delay = 24 + i * 8;
            const s = spring({
              frame: frame - delay,
              fps,
              config: { damping: 14, stiffness: 90 },
            });
            const rotations = [3, -2, 4, -1.5];
            const offsets = [
              { x: 0, y: 0 },
              { x: 30, y: 20 },
              { x: -20, y: 50 },
              { x: 40, y: 80 },
            ];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: offsets[i].x,
                  top: offsets[i].y,
                  width: 380,
                  height: 100,
                  background: COLORS.bgSurfaceElevated,
                  border: `1px solid ${COLORS.borderPrimary}`,
                  borderRadius: 16,
                  opacity: s * 0.8,
                  transform: `rotate(${rotations[i] * s}deg)`,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 20px',
                }}
              >
                <div
                  style={{
                    width: '60%',
                    height: 10,
                    borderRadius: 5,
                    background: COLORS.borderPrimary,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Focal text */}
        <div
          style={{
            position: 'absolute',
            bottom: 120,
            left: '50%',
            transform: `translateX(-50%) translateY(${textY}px)`,
            opacity: textOpacity,
            fontFamily: inter,
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.textPrimary,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          Too many tabs. Not enough clarity.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
