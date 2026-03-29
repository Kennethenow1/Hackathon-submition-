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
import { Cursor } from '../utils/Cursor';

export const SCENE6_DURATION = 240;

const callouts = [
  { label: 'Choose another file', target: 'Reselect File' },
  { label: 'Run AI extraction', target: 'Process Photo' },
  { label: 'Retake with camera', target: 'Retake Photo' },
];

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoomScale = interpolate(frame, [0, 18], [1.0, 1.18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Confirmation pulse after click
  const clicked = frame >= 132;
  const pulseRing = clicked
    ? interpolate(frame, [136, 170], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const pulseScale = interpolate(pulseRing, [0, 1], [1, 1.6]);
  const pulseOp = interpolate(pulseRing, [0, 0.3, 1], [0.6, 0.4, 0]);

  const exitOp = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <GradientBg colors={[COLORS.lightGray, COLORS.offWhite, COLORS.subtleBlue, COLORS.white]} />
      <Particles count={8} color="rgba(74,143,231,0.12)" />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${zoomScale})`,
          opacity: exitOp,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 40,
            fontFamily: FONT_FAMILY,
          }}
        >
          {/* Preview */}
          <div
            style={{
              width: 340,
              height: 360,
              background: COLORS.offWhite,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ fontSize: 56 }}>📋</div>
          </div>

          {/* Buttons + callouts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
            {[
              { label: 'Reselect File', primary: false },
              { label: 'Process Photo', primary: true },
              { label: 'Retake Photo', primary: false },
            ].map((btn, i) => {
              const enter = spring({ frame, fps, delay: 16 + i * 6, config: { damping: 20, stiffness: 80 } });
              const tx = interpolate(enter, [0, 1], [40, 0], { extrapolateRight: 'clamp' });

              // Hover sweep
              const hoverRange = [46 + i * 14, 46 + i * 14 + 10];
              const hoverGlow = frame >= hoverRange[0] && frame <= hoverRange[1]
                ? interpolate(frame, hoverRange, [0, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : 0;

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: enter, transform: `translateX(${tx}px)` }}>
                  <div
                    style={{
                      padding: '14px 28px',
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: 600,
                      background: btn.primary ? COLORS.accentBlue : COLORS.offWhite,
                      color: btn.primary ? '#fff' : COLORS.charcoal,
                      border: btn.primary ? 'none' : `1px solid ${COLORS.lightGray}`,
                      position: 'relative',
                      boxShadow: hoverGlow > 0 ? `0 0 16px rgba(59,125,216,${hoverGlow})` : 'none',
                      minWidth: 180,
                      textAlign: 'center' as const,
                    }}
                  >
                    {btn.label}
                    {btn.primary && clicked && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: -6,
                          borderRadius: 18,
                          border: `2px solid rgba(59,125,216,${pulseOp})`,
                          transform: `scale(${pulseScale})`,
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </div>
                  {/* Callout label */}
                  <div
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(255,255,255,0.75)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 500,
                      color: COLORS.charcoal,
                      border: '1px solid rgba(255,255,255,0.3)',
                      opacity: enter,
                    }}
                  >
                    {callouts[i]?.label ?? ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Cursor
          startDelay={0}
          points={[
            { x: 1190, y: 420, frame: 62 },
            { x: 1150, y: 500, frame: 84 },
            { x: 1130, y: 580, frame: 102 },
            { x: 1150, y: 500, frame: 124 },
            { x: 1150, y: 500, frame: 132, click: true },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
