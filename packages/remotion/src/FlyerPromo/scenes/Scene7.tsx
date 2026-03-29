import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { FloatingBrowser } from '../../BrowserFrame';
import { COLORS } from '../constants';
import { FONT_FAMILY } from '../fonts';
import { GradientBg } from '../utils/GradientBg';
import { Particles } from '../utils/Particles';
import { LensFlare } from '../utils/LensFlare';
import { Cursor } from '../utils/Cursor';

export const SCENE7_DURATION = 240;

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const showSuccess = frame >= 106;
  const successEnter = spring({ frame, fps, delay: 106, config: { damping: 18, stiffness: 70 } });
  const successY = interpolate(successEnter, [0, 1], [40, 0], { extrapolateRight: 'clamp' });

  // Connect button enter
  const connectEnter = spring({ frame, fps, delay: 16, config: { damping: 18, stiffness: 80 } });
  const connectScale = interpolate(connectEnter, [0, 1], [0.92, 1], { extrapolateRight: 'clamp' });

  // Status morph
  const statusFade = frame >= 90 ? interpolate(frame, [90, 112], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;

  // Checkmark draw
  const checkProgress = frame >= 122 ? interpolate(frame, [122, 140], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

  // View button
  const viewEnter = spring({ frame, fps, delay: 132, config: { damping: 20, stiffness: 80 } });

  // OAuth glow line
  const oauthProgress = frame >= 56 && frame <= 96
    ? interpolate(frame, [56, 96], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const camScale = interpolate(frame, [0, 240], [1.0, 1.04], { extrapolateRight: 'clamp' });

  const exitOp = interpolate(frame, [210, 240], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <GradientBg colors={[COLORS.subtleBlue, COLORS.white, COLORS.offWhite, COLORS.lightGray]} />
      <Particles count={10} color="rgba(74,143,231,0.12)" />
      <LensFlare x={80} y={25} size={200} />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${camScale})`,
          opacity: exitOp,
        }}
      >
        <FloatingBrowser
          url="flyer.it.com"
          width={860}
          rotateX={-6}
          rotateY={8}
          scale={0.88}
          enterDelay={0}
          durationInFrames={240}
        >
          <div style={{ padding: 28, fontFamily: FONT_FAMILY, minHeight: 400, background: COLORS.white }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: COLORS.charcoal }}>Flyer</div>

            {/* Calendar Connection Section */}
            <div
              style={{
                border: `1px solid ${COLORS.lightGray}`,
                borderRadius: 12,
                padding: 18,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                position: 'relative',
              }}
            >
              <div style={{ opacity: interpolate(spring({ frame, fps, delay: 10, config: { damping: 200 } }), [0, 1], [0, 1]) }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: COLORS.darkText, margin: '0 0 2px' }}>Google Calendar</h3>
                <span style={{ fontSize: 12, color: COLORS.midGray, opacity: statusFade }}>Not connected</span>
              </div>
              <div
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  background: COLORS.offWhite,
                  border: `1px solid ${COLORS.lightGray}`,
                  fontSize: 13,
                  fontWeight: 600,
                  color: COLORS.charcoal,
                  transform: `scale(${connectScale})`,
                  opacity: connectEnter,
                }}
              >
                Connect
              </div>

              {/* OAuth glow line */}
              {oauthProgress > 0 && oauthProgress < 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${30 + oauthProgress * 50}%`,
                    width: 40,
                    height: 3,
                    borderRadius: 2,
                    background: COLORS.subtleBlue,
                    boxShadow: `0 0 12px ${COLORS.subtleBlue}`,
                    transform: 'translateY(-50%)',
                  }}
                />
              )}
            </div>

            {/* Success panel */}
            {showSuccess && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '28px 0',
                  opacity: successEnter,
                  transform: `translateY(${successY}px)`,
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#E8F9EE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    fontSize: 28,
                    position: 'relative',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path
                      d="M7 14L12 19L21 10"
                      stroke={COLORS.successGreen}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="28"
                      strokeDashoffset={28 - checkProgress * 28}
                    />
                  </svg>
                  {/* Dashed ring */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: -8,
                      borderRadius: '50%',
                      border: `2px dashed ${COLORS.successGreen}44`,
                    }}
                  />
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.darkText }}>Event added to calendar</div>
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: 14,
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: COLORS.accentBlue,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    opacity: viewEnter,
                    transform: `scale(${interpolate(viewEnter, [0, 1], [0.9, 1])})`,
                  }}
                >
                  View
                </div>
              </div>
            )}
          </div>
        </FloatingBrowser>

        <Cursor
          startDelay={0}
          points={[
            { x: 1240, y: 400, frame: 42 },
            { x: 1180, y: 420, frame: 56, click: true },
            { x: 1000, y: 600, frame: 140 },
            { x: 960, y: 640, frame: 158, click: true },
          ]}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
