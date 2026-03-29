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
import { LensFlare } from '../utils/LensFlare';
import { WordByWord } from '../utils/WordByWord';

export const SCENE1_DURATION = 180;

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exit animations
  const exitOpacity = interpolate(frame, [150, 180], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [150, 180], [1, 0.98], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Flyer sheets
  const sheets = [
    { delay: 6, rotZ: -8, x: 820, y: 180 },
    { delay: 12, rotZ: 4, x: 1000, y: 280 },
    { delay: 18, rotZ: 10, x: 900, y: 420 },
  ];

  // Subtitle
  const sub = spring({ frame, fps, delay: 12, config: { damping: 20, stiffness: 60 } });
  const subY = interpolate(sub, [0, 1], [28, 0], { extrapolateRight: 'clamp' });

  // Background scale
  const bgScale = interpolate(frame, [0, 180], [1.0, 1.04], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ transform: `scale(${bgScale})`, width: '100%', height: '100%' }}>
        <GradientBg colors={[COLORS.subtleBlue, COLORS.lightGray, COLORS.offWhite, COLORS.midGray]} />
      </div>
      <Particles count={18} color="rgba(74,143,231,0.2)" />
      <LensFlare x={75} y={25} size={300} />
      <LensFlare x={85} y={65} size={200} color="rgba(200,210,230,0.25)" />

      <AbsoluteFill
        style={{
          opacity: exitOpacity,
          transform: `scale(${exitScale})`,
        }}
      >
        {/* Text block */}
        <div
          style={{
            position: 'absolute',
            left: 120,
            top: 280,
            width: '46%',
          }}
        >
          <WordByWord
            text="Flyers are everywhere."
            startFrame={0}
            frameGap={4}
            fontSize={62}
            fontWeight={700}
            color={COLORS.darkText}
            fontFamily={FONT_FAMILY}
          />
          <div
            style={{
              opacity: sub,
              transform: `translateY(${subY}px)`,
              fontSize: 28,
              fontWeight: 400,
              color: COLORS.charcoal,
              fontFamily: FONT_FAMILY,
              marginTop: 18,
              lineHeight: 1.4,
            }}
          >
            But event details still get typed by hand.
          </div>
        </div>

        {/* Flyer sheets */}
        {sheets.map((s, i) => {
          const enter = spring({ frame, fps, delay: s.delay, config: { damping: 18, stiffness: 60 } });
          const floatY = frame > 26 ? Math.sin((frame - 26) * 0.04 + i * 1.2) * 10 : 0;
          const floatX = frame > 26 ? Math.sin((frame - 26) * 0.025 + i * 0.8) * 4 : 0;
          const exitZ = interpolate(frame, [150, 180], [0, -100 - i * 40], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const exitBlur = interpolate(frame, [150, 180], [0, 3 + i], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: s.x + floatX,
                top: s.y + floatY,
                width: 240,
                height: 320,
                background: 'linear-gradient(145deg, #fff 0%, #f0f1f4 100%)',
                borderRadius: 14,
                boxShadow: '0 16px 40px -8px rgba(0,0,0,0.15)',
                opacity: enter,
                transform: `rotateZ(${interpolate(enter, [0, 1], [s.rotZ * 2, s.rotZ])}deg) translateZ(${exitZ}px)`,
                filter: `blur(${exitBlur}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontFamily: FONT_FAMILY,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 36 }}>📋</div>
              <div style={{ width: '80%', height: 6, borderRadius: 3, background: COLORS.lightGray }} />
              <div style={{ width: '60%', height: 6, borderRadius: 3, background: COLORS.lightGray }} />
              <div style={{ width: '70%', height: 6, borderRadius: 3, background: COLORS.lightGray }} />
              <div style={{ width: '50%', height: 6, borderRadius: 3, background: COLORS.lightGray }} />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
