import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from 'remotion';
import { GradientMeshBg } from '../helpers/GradientMeshBg';
import { Particles } from '../helpers/Particles';
import { BlurredOrb } from '../helpers/BlurredOrb';
import { LensFlare } from '../helpers/LensFlare';
import { COLORS } from '../constants';
import { WordByWord } from '../helpers/WordByWord';

export const Scene5_VideoExplanations: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardS = spring({ frame, fps, config: { damping: 18, stiffness: 60 } });
  const cardX = interpolate(cardS, [0, 1], [80, 0]);
  const cardScale = interpolate(cardS, [0, 1], [0.94, 1]);
  const cardO = interpolate(cardS, [0, 1], [0, 1]);

  // Camera push-in
  const cameraZ = interpolate(frame, [12, 60], [1.0, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Progress bar
  const progressW = interpolate(frame, [30, 66], [0, 78], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Caption panel
  const capS = spring({ frame: frame - 46, fps, config: { damping: 14, stiffness: 80 } });
  const capX = interpolate(capS, [0, 1], [-60, 0]);
  const capO = interpolate(capS, [0, 1], [0, 1]);

  // Glow pulse
  const glowPulse = interpolate(Math.sin(frame * 0.07), [-1, 1], [0.4, 0.8]);

  // Exit
  const exitO = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [100, 120], [1, 1.03], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GradientMeshBg colors={[COLORS.white, COLORS.bgGray50, COLORS.bluePrimary, COLORS.bgGray100]} intensity={0.7} />
      <Particles count={12} color="rgba(52,144,220,0.25)" seed={200} />
      <BlurredOrb x={75} y={30} size={260} />
      <BlurredOrb x={20} y={70} size={200} color="rgba(52,144,220,0.1)" />
      <LensFlare x={80} y={20} size={350} color={COLORS.bluePrimary} />

      <AbsoluteFill
        style={{
          transform: `scale(${cameraZ * exitScale})`,
          opacity: exitO,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Caption panel */}
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: '35%',
            transform: `translateX(${capX}px)`,
            opacity: capO,
            maxWidth: 340,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 13, color: COLORS.bluePrimary, fontWeight: 600, marginBottom: 8 }}>AI-Powered</div>
          <WordByWord
            text="Educational video explanation for your question"
            startFrame={66}
            staggerFrames={3}
            fontSize={22}
            fontWeight={500}
            color={COLORS.textBlack}
          />
        </div>

        {/* Video card */}
        <div
          style={{
            transform: `translateX(${cardX}px) scale(${cardScale})`,
            opacity: cardO,
            width: 520,
            background: COLORS.white,
            borderRadius: 20,
            padding: 0,
            border: `1px solid ${COLORS.borderGray200}`,
            boxShadow: `0 20px 60px -16px rgba(0,0,0,0.15), 0 0 40px ${COLORS.bluePrimary}${Math.round(glowPulse * 25).toString(16).padStart(2, '0')}`,
            overflow: 'hidden',
            marginLeft: 200,
          }}
        >
          <div style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <h3 style={{ fontSize: 24, fontWeight: 400, color: COLORS.textBlack, margin: '0 0 8px', fontFamily: 'system-ui, sans-serif' }}>
              AI Video Explanations
            </h3>
            <p style={{ fontSize: 14, color: COLORS.textGray500, margin: 0, fontFamily: 'system-ui, sans-serif' }}>
              Custom video walkthroughs generated for your exact problem
            </p>
          </div>

          {/* Playback strip */}
          <div
            style={{
              height: 48,
              background: COLORS.bgGray50,
              borderTop: `1px solid ${COLORS.borderGray100}`,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: COLORS.bluePrimary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 12,
              }}
            >
              ▶
            </div>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: COLORS.borderGray200 }}>
              <div
                style={{
                  width: `${progressW}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${COLORS.bluePrimary}, #2563eb)`,
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: COLORS.textGray500, fontFamily: 'system-ui, sans-serif' }}>1:24</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
