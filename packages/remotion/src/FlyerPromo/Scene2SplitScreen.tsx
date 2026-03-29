import React from 'react';
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

const MANUAL_ITEMS = [
  'Open calendar app manually',
  'Search for the event date',
  'Retype event name, time, location',
  'Hope you got the details right',
  'Set a reminder too...',
];

export const Scene2SplitScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relative frame (scene starts at absolute 90)
  const f = frame;

  // Exit
  const exitOpacity = interpolate(f, [102, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Divider wipe (frames 0-18 relative)
  const dividerW = interpolate(f, [0, 18], [0, 4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Camera push toward right (frames 84-120 relative)
  const pushScale = interpolate(f, [84, 120], [1.0, 1.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const pushX = interpolate(f, [84, 120], [0, -60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Left panel parallax
  const leftDrift = interpolate(f, [42, 120], [0, -12], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Right panel parallax
  const rightDrift = interpolate(f, [42, 120], [0, -22], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Upload text highlight sweep (frames 60-96 relative)
  const uploadSweep = interpolate(f, [60, 96], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Outfit, sans-serif',
        opacity: exitOpacity,
        overflow: 'hidden',
      }}
    >
      <GradientMeshBg
        colors={[COLORS.accentSoft, COLORS.accentLight, '#f3f4f6', '#e5e7eb']}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={10} color="rgba(99,102,241,0.3)" />
      </AbsoluteFill>

      {/* Camera push wrapper */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${pushScale}) translateX(${pushX}px)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
          }}
        >
          {/* Left: Manual panel */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 80,
              transform: `translateY(${leftDrift}px)`,
            }}
          >
            {/* Label */}
            {(() => {
              const s = spring({ frame: f - 6, fps, config: { damping: 16, stiffness: 120 } });
              return (
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: COLORS.textSecondary,
                    marginBottom: 24,
                    opacity: interpolate(s, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                  }}
                >
                  Manual
                </div>
              );
            })()}

            {/* Manual items */}
            {MANUAL_ITEMS.map((item, i) => {
              const delay = 6 + i * 6;
              const s = spring({ frame: f - delay, fps, config: { damping: 16, stiffness: 100 } });
              return (
                <div
                  key={i}
                  style={{
                    width: '100%',
                    background: COLORS.bgCard,
                    borderRadius: 12,
                    padding: '14px 20px',
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    opacity: interpolate(s, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#e5e7eb',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 15,
                      color: COLORS.textSecondary,
                      fontWeight: 500,
                    }}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div
            style={{
              width: dividerW,
              background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.3), transparent)',
              position: 'relative',
              zIndex: 10,
            }}
          />

          {/* Right: Flyer upload panel */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 80,
              transform: `translateY(${rightDrift}px)`,
            }}
          >
            {/* Label */}
            {(() => {
              const s = spring({ frame: f - 14, fps, config: { damping: 16, stiffness: 120 } });
              return (
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: COLORS.accent,
                    marginBottom: 24,
                    opacity: interpolate(s, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                  }}
                >
                  Flyer
                </div>
              );
            })()}

            {/* Upload card */}
            {(() => {
              const s = spring({ frame: f - 14, fps, config: { damping: 16, stiffness: 80 } });
              return (
                <div
                  style={{
                    width: '100%',
                    background: COLORS.bgCard,
                    borderRadius: 20,
                    padding: 40,
                    boxShadow: '0 20px 50px -12px rgba(99,102,241,0.2), 0 8px 24px rgba(0,0,0,0.08)',
                    opacity: interpolate(s, [0, 1], [0, 1]),
                    transform: `scale(${interpolate(s, [0, 1], [0.9, 1.0])})`,
                  }}
                >
                  {/* Upload icon */}
                  {(() => {
                    const is = spring({ frame: f - 18, fps, config: { damping: 14, stiffness: 120 } });
                    return (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          marginBottom: 20,
                          opacity: interpolate(is, [0, 1], [0, 1]),
                          transform: `scale(${interpolate(is, [0, 1], [0.7, 1.0])})`,
                        }}
                      >
                        <div
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            background: COLORS.accentSoft,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="4" stroke={COLORS.accent} strokeWidth="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" stroke={COLORS.accent} strokeWidth="1.5" />
                            <polyline points="21 15 16 10 5 21" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Main text */}
                  {(() => {
                    const ts = spring({ frame: f - 24, fps, config: { damping: 16, stiffness: 100 } });
                    return (
                      <div
                        style={{
                          textAlign: 'center',
                          opacity: interpolate(ts, [0, 1], [0, 1]),
                          transform: `translateY(${interpolate(ts, [0, 1], [16, 0])}px)`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: COLORS.textPrimary,
                            marginBottom: 8,
                            position: 'relative',
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              height: '35%',
                              width: `${uploadSweep}%`,
                              background: COLORS.accentSoft,
                              borderRadius: 3,
                              opacity: 0.8,
                            }}
                          />
                          <span style={{ position: 'relative' }}>Drop your image or PDF here</span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: COLORS.textMuted,
                            marginBottom: 20,
                          }}
                        >
                          Supports PNG, JPG, PDF
                        </div>
                      </div>
                    );
                  })()}

                  {/* Divider */}
                  {(() => {
                    const ds = spring({ frame: f - 30, fps, config: { damping: 16, stiffness: 100 } });
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 20,
                          opacity: interpolate(ds, [0, 1], [0, 1]),
                        }}
                      >
                        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
                        <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>or</span>
                        <div style={{ flex: 1, height: 1, background: COLORS.border }} />
                      </div>
                    );
                  })()}

                  {/* Camera button */}
                  {(() => {
                    const bs = spring({ frame: f - 34, fps, config: { damping: 14, stiffness: 100 } });
                    return (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          opacity: interpolate(bs, [0, 1], [0, 1]),
                          transform: `translateY(${interpolate(bs, [0, 1], [16, 0])}px)`,
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 28px',
                            borderRadius: 12,
                            border: `1.5px solid ${COLORS.border}`,
                            background: COLORS.bgCard,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 15,
                            fontWeight: 600,
                            color: COLORS.textPrimary,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={COLORS.textPrimary} strokeWidth="2" />
                            <circle cx="12" cy="13" r="4" stroke={COLORS.textPrimary} strokeWidth="2" />
                          </svg>
                          Take a Photo
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
