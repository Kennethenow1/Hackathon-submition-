import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { COLORS } from './colors';

const { loadFont } = require('@remotion/google-fonts/Outfit');
loadFont();

const PROOF_LABELS = [
  { label: 'Seconds saved', value: 120, suffix: 's', delay: 36 },
  { label: 'No retyping', value: 100, suffix: '%', delay: 44 },
];

const MetricCounter: React.FC<{
  value: number;
  suffix?: string;
  delay?: number;
}> = ({ value, suffix = '', delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 40 },
  });
  const displayValue = Math.round(
    interpolate(progress, [0, 1], [0, value])
  );
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};

export const Scene7Success: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Relative frames (scene starts at absolute 750)

  // Success card spring in (frames 0-24 relative)
  const cardS = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const cardY = interpolate(cardS, [0, 1], [32, 0]);
  const cardScale = interpolate(cardS, [0, 1], [0.94, 1.0]);
  const cardO = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Check icon (frames 12-36 relative)
  const checkS = spring({ frame: frame - 12, fps, config: { damping: 10, stiffness: 120 } });
  const checkScale = interpolate(checkS, [0, 1], [0.4, 1.0]);
  const checkGlow = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);

  // Title (frames 24-54 relative)
  const titleS = spring({ frame: frame - 24, fps, config: { damping: 16, stiffness: 100 } });
  const titleO = interpolate(titleS, [0, 1], [0, 1]);
  const titleY = interpolate(titleS, [0, 1], [16, 0]);

  // View button (frames 36-66 relative)
  const viewS = spring({ frame: frame - 36, fps, config: { damping: 16, stiffness: 100 } });
  const viewO = interpolate(viewS, [0, 1], [0, 1]);
  const viewY = interpolate(viewS, [0, 1], [16, 0]);

  // Proof labels (frames 36-72 relative)
  const proofLabelS0 = spring({ frame: frame - 36, fps, config: { damping: 16, stiffness: 80 } });
  const proofLabelS1 = spring({ frame: frame - 44, fps, config: { damping: 16, stiffness: 80 } });
  const proofSprings = [proofLabelS0, proofLabelS1];

  // Camera push-in (frames 54-90 relative)
  const camPush = interpolate(frame, [54, 90], [1.0, 1.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Halo pulse
  const haloPulse = interpolate(Math.sin(frame * 0.07), [-1, 1], [0.15, 0.4]);

  // Float drift
  const floatY = Math.sin(frame * 0.025) * 6;

  // Exit (frames 82-90 relative)
  const exitO = interpolate(frame, [82, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Outfit, sans-serif',
        opacity: exitO,
        overflow: 'hidden',
      }}
    >
      <GradientMeshBg
        colors={[COLORS.success + '44', COLORS.accentSoft, COLORS.accentLight, '#f0fff4']}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={14} color="rgba(34,197,94,0.25)" />
      </AbsoluteFill>

      {/* Halo ring */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          height: 400,
          borderRadius: '50%',
          border: `2px solid rgba(34,197,94,${haloPulse})`,
          boxShadow: `0 0 60px rgba(34,197,94,${haloPulse * 0.3})`,
          pointerEvents: 'none',
        }}
      />

      {/* Camera push */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${camPush})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Main success card */}
        <div
          style={{
            opacity: cardO,
            transform: `translateY(${cardY + floatY}px) scale(${cardScale})`,
          }}
        >
          <div
            style={{
              width: 420,
              background: COLORS.bgCard,
              borderRadius: 24,
              padding: 48,
              boxShadow: '0 24px 80px -16px rgba(34,197,94,0.22), 0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid rgba(34,197,94,0.2)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 20,
            }}
          >
            {/* Check icon */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: COLORS.success,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${checkScale})`,
                boxShadow: `0 8px 32px rgba(34,197,94,${checkGlow})`,
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <polyline
                  points="20 6 9 17 4 12"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: COLORS.textPrimary,
                textAlign: 'center',
                opacity: titleO,
                transform: `translateY(${titleY}px)`,
              }}
            >
              Event added to calendar
            </div>

            {/* View button */}
            <div
              style={{
                opacity: viewO,
                transform: `translateY(${viewY}px)`,
              }}
            >
              <div
                style={{
                  padding: '12px 32px',
                  borderRadius: 12,
                  background: COLORS.success,
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 16px rgba(34,197,94,0.35)',
                }}
              >
                View
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="white" strokeWidth="2" />
                  <polyline points="15 3 21 3 21 9" stroke="white" strokeWidth="2" />
                  <line x1="10" y1="14" x2="21" y2="3" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Proof label cards */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 20,
              justifyContent: 'center',
            }}
          >
            {PROOF_LABELS.map((proof, i) => {
              const s = proofSprings[i];
              const o = interpolate(s, [0, 1], [0, 1]);
              const y = interpolate(s, [0, 1], [20, 0]);
              return (
                <div
                  key={i}
                  style={{
                    padding: '14px 20px',
                    background: COLORS.bgCard,
                    borderRadius: 14,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    border: `1px solid ${COLORS.border}`,
                    opacity: o,
                    transform: `translateY(${y}px)`,
                    textAlign: 'center',
                    minWidth: 160,
                  }}
                >
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      color: COLORS.accent,
                    }}
                  >
                    <MetricCounter
                      value={proof.value}
                      suffix={proof.suffix}
                      delay={proof.delay}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.textSecondary,
                      marginTop: 4,
                      fontWeight: 500,
                    }}
                  >
                    {proof.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
