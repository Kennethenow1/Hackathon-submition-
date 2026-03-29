import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { BrowserFrame } from '../../BrowserFrame';
import { COLORS } from '../constants';
import { FONT_FAMILY } from '../fonts';
import { GradientBg } from '../utils/GradientBg';
import { Particles } from '../utils/Particles';
import { LensFlare } from '../utils/LensFlare';
import { Cursor } from '../utils/Cursor';

export const SCENE5_DURATION = 240;

const extractionChips = [
  { label: 'Community Fair', icon: '📝', delay: 34 },
  { label: 'June 14, 2025', icon: '📅', delay: 46 },
  { label: '2:00 PM', icon: '🕐', delay: 58 },
  { label: 'Central Park', icon: '📍', delay: 70 },
];

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camScale = interpolate(frame, [0, 240], [1.0, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Scan bar
  const scanY = frame >= 24 && frame <= 72
    ? interpolate(frame, [24, 72], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : frame > 72 && frame <= 110
      ? interpolate(frame, [72, 110], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
      : -10;

  // Process button glow
  const processGlow = frame >= 96 && frame <= 118
    ? interpolate(Math.sin((frame - 96) * 0.25), [-1, 1], [0.2, 0.7])
    : 0;

  const exitOp = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <GradientBg colors={[COLORS.subtleBlue, COLORS.offWhite, COLORS.lightGray, COLORS.accentBlue]} />
      <Particles count={16} color="rgba(74,143,231,0.12)" />
      <LensFlare x={15} y={35} size={220} />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${camScale})`,
          opacity: exitOp,
        }}
      >
        <BrowserFrame url="flyer.it.com" width={900}>
          <div
            style={{
              display: 'flex',
              gap: 24,
              padding: 28,
              fontFamily: FONT_FAMILY,
              position: 'relative',
              minHeight: 400,
              background: COLORS.white,
            }}
          >
            {/* Left: Preview */}
            <div
              style={{
                flex: '0 0 340',
                background: COLORS.offWhite,
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 320,
              }}
            >
              <div style={{ fontSize: 52 }}>📋</div>
              <div style={{ fontSize: 13, color: COLORS.midGray, marginTop: 8 }}>Uploaded flyer</div>

              {/* Scan line */}
              {scanY >= 0 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${scanY}%`,
                    height: 3,
                    background: `linear-gradient(90deg, transparent, ${COLORS.subtleBlue}, transparent)`,
                    boxShadow: `0 0 12px ${COLORS.subtleBlue}`,
                  }}
                />
              )}

              {/* Remove button */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                ×
              </div>
            </div>

            {/* Right: Extraction chips */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.charcoal, marginBottom: 8 }}>
                Extracted Details
              </div>
              {extractionChips.map((chip, i) => {
                const enter = spring({ frame, fps, delay: chip.delay, config: { damping: 18, stiffness: 70 } });
                const tx = interpolate(enter, [0, 1], [60, 0], { extrapolateRight: 'clamp' });
                return (
                  <div
                    key={i}
                    style={{
                      padding: '12px 16px',
                      background: COLORS.softBlue,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      opacity: enter,
                      transform: `translateX(${tx}px)`,
                      boxShadow: '0 2px 8px rgba(74,143,231,0.08)',
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{chip.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.charcoal }}>{chip.label}</span>
                  </div>
                );
              })}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <div
                  style={{
                    padding: '10px 20px',
                    background: COLORS.offWhite,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.charcoal,
                    border: `1px solid ${COLORS.lightGray}`,
                  }}
                >
                  Reselect File
                </div>
                <div
                  style={{
                    padding: '10px 20px',
                    background: COLORS.accentBlue,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#fff',
                    position: 'relative',
                  }}
                >
                  Process Photo
                  {processGlow > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: 14,
                        boxShadow: `0 0 20px rgba(59,125,216,${processGlow})`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </BrowserFrame>

        <Cursor
          startDelay={0}
          points={[
            { x: 1090, y: 760, frame: 118 },
            { x: 1050, y: 720, frame: 126 },
            { x: 1050, y: 720, frame: 132, click: true },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
