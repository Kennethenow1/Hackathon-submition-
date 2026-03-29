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

const MESSAGES = [
  { type: 'user', text: 'I don\'t understand integration by parts', delay: 16 },
  { type: 'ai', text: 'Think of it like the product rule in reverse. Let me show you step by step...', delay: 46 },
  { type: 'user', text: 'Oh, so u is the part I want to simplify?', delay: 92 },
];

export const Scene7Tutor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const cardY = interpolate(cardSpring, [0, 1], [60, 0]);

  // Typing indicator
  const typingVisible = frame >= 40 && frame < 46;

  // Camera push
  const camPush = interpolate(frame, [50, 120], [1.0, 1.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Ambient float
  const floatY = Math.sin(frame * 0.02) * 4;

  // Exit
  const exitOpacity = interpolate(frame, [108, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ background: COLORS.bgPrimary }}>
      <GradientMesh
        colors={[
          COLORS.bgPrimary,
          COLORS.accentBlue,
          COLORS.accentPurple,
          COLORS.bgSurface,
        ]}
      />
      <Particles count={12} colors={[COLORS.accentBlue, COLORS.accentPurple]} opacity={0.2} />

      <AbsoluteFill
        style={{
          transform: `scale(${camPush})`,
          opacity: exitOpacity,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Chat card */}
        <div
          style={{
            width: 560,
            background: COLORS.bgSurfaceElevated,
            border: `1px solid ${COLORS.borderPrimary}`,
            borderRadius: 28,
            padding: 24,
            boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
            opacity: cardSpring,
            transform: `translateY(${cardY + floatY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: inter,
              fontSize: 18,
              fontWeight: 600,
              color: COLORS.textPrimary,
              marginBottom: 18,
            }}
          >
            🧑🏫 AI Tutor
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MESSAGES.map((msg, i) => {
              const s = spring({
                frame: frame - msg.delay,
                fps,
                config: { damping: 16, stiffness: 100 },
              });
              const scale = interpolate(s, [0, 1], [0.94, 1]);
              const isUser = msg.type === 'user';

              return (
                <div
                  key={i}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    opacity: s,
                    transform: `scale(${scale})`,
                  }}
                >
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 16,
                      ...(isUser
                        ? {
                            borderBottomRightRadius: 4,
                            background: COLORS.accentBlue,
                            color: '#fff',
                          }
                        : {
                            borderBottomLeftRadius: 4,
                            background: COLORS.bgSurface,
                            border: `1px solid ${COLORS.borderSecondary}`,
                            color: COLORS.textSecondary,
                          }),
                      fontFamily: inter,
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {typingVisible && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 16px',
                  background: COLORS.bgSurface,
                  border: `1px solid ${COLORS.borderSecondary}`,
                  borderRadius: 16,
                  display: 'flex',
                  gap: 4,
                }}
              >
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: COLORS.textMuted,
                      opacity:
                        0.4 +
                        Math.sin(frame * 0.15 + d * 1.2) * 0.4,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side caption */}
        <div
          style={{
            position: 'absolute',
            right: 100,
            top: '42%',
            opacity: interpolate(frame, [50, 80], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            transform: `translateX(${interpolate(frame, [50, 80], [30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
            fontFamily: inter,
            fontSize: 18,
            fontWeight: 500,
            color: COLORS.textSecondary,
            maxWidth: 220,
            lineHeight: 1.6,
          }}
        >
          Ask follow-ups until it clicks.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
