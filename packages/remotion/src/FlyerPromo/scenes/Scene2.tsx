import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { FONT_FAMILY } from '../fonts';
import { COLORS } from '../constants';
import { GradientBg } from '../utils/GradientBg';
import { Particles } from '../utils/Particles';
import { Cursor } from '../utils/Cursor';

export const SCENE2_DURATION = 180;

const fields = [
  { label: 'Event Title', icon: '📝' },
  { label: 'Date', icon: '📅' },
  { label: 'Time', icon: '🕐' },
  { label: 'Location', icon: '📍' },
];

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camScale = interpolate(frame, [24, 150], [1.0, 1.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const exitOp = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Flyer card enter
  const flyerEnter = spring({ frame, fps, delay: 0, config: { damping: 20, stiffness: 60 } });
  const flyerX = interpolate(flyerEnter, [0, 1], [-80, 0], { extrapolateRight: 'clamp' });
  const flyerRotY = interpolate(flyerEnter, [0, 1], [-10, 0], { extrapolateRight: 'clamp' });

  // Warning pips
  const warnPulse = interpolate(Math.sin(frame * 0.1), [-1, 1], [0.4, 1]);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <GradientBg colors={[COLORS.subtleBlue, COLORS.offWhite, COLORS.lightGray, COLORS.midGray]} />
      <Particles count={10} color="rgba(176,184,196,0.25)" />

      <AbsoluteFill
        style={{
          transform: `scale(${camScale})`,
          opacity: exitOp,
        }}
      >
        {/* Left flyer card */}
        <div
          style={{
            position: 'absolute',
            left: 180,
            top: 200,
            width: 380,
            height: 480,
            background: 'linear-gradient(145deg, #fff 0%, #f2f3f6 100%)',
            borderRadius: 18,
            boxShadow: '0 18px 48px -12px rgba(0,0,0,0.14)',
            transform: `translateX(${flyerX}px) rotateY(${flyerRotY}deg)`,
            opacity: flyerEnter,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            fontFamily: FONT_FAMILY,
            perspective: 800,
          }}
        >
          <div style={{ fontSize: 52 }}>📋</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.charcoal }}>Community Fair</div>
          <div style={{ fontSize: 13, color: COLORS.midGray }}>Sat, June 14 • 2:00 PM</div>
          <div style={{ fontSize: 13, color: COLORS.midGray }}>Central Park, Main Pavilion</div>
          {[80, 60, 70, 50].map((w, i) => (
            <div
              key={i}
              style={{
                width: `${w}%`,
                height: 6,
                borderRadius: 3,
                background: COLORS.lightGray,
              }}
            />
          ))}
        </div>

        {/* Right task cards */}
        <div style={{ position: 'absolute', right: 180, top: 220, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map((f, i) => {
            const enter = spring({ frame, fps, delay: 8 + i * 6, config: { damping: 20, stiffness: 80 } });
            const ty = interpolate(enter, [0, 1], [40, 0], { extrapolateRight: 'clamp' });
            const showWarn = frame >= 60 && frame <= 108;
            return (
              <div
                key={i}
                style={{
                  width: 380,
                  padding: '16px 20px',
                  background: COLORS.white,
                  borderRadius: 14,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  opacity: enter,
                  transform: `translateY(${ty}px)`,
                  fontFamily: FONT_FAMILY,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: COLORS.midGray, fontWeight: 500 }}>{f.label}</div>
                  <div
                    style={{
                      width: 140 + i * 20,
                      height: 8,
                      borderRadius: 4,
                      background: COLORS.lightGray,
                      marginTop: 4,
                    }}
                  />
                </div>
                {showWarn && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: 14,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: COLORS.warmOrange,
                      opacity: warnPulse,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Cursor
          startDelay={0}
          points={[
            { x: 1180, y: 260, frame: 36 },
            { x: 1080, y: 330, frame: 52 },
            { x: 1100, y: 430, frame: 64 },
            { x: 1060, y: 530, frame: 78 },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
