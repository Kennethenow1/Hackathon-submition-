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
import { GlassPanel } from '../helpers/GlassPanel';
import { FeatureCard } from '../helpers/FeatureCard';
import { WordByWord } from '../helpers/WordByWord';
import { COLORS } from '../constants';

export const Scene5_AIVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Card entrance
  const cardSpring = spring({ frame, fps, config: { damping: 16, stiffness: 60 } });
  const cardX = interpolate(cardSpring, [0, 1], [80, 0]);
  const cardScale = interpolate(cardSpring, [0, 1], [0.94, 1]);
  const cardO = interpolate(cardSpring, [0, 1], [0, 1]);

  // Camera push
  const cameraScale = interpolate(frame, [12, 42], [1, 1.06], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Progress bar
  const progressWidth = interpolate(frame, [30, 66], [0, 85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Glow pulse at end
  const glowPulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.7]);

  // Dim at end
  const dimO = interpolate(frame, [96, 120], [1, 0.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GradientMeshBg colors={['#3490dc', '#f9fafb', '#ffffff', '#dbeafe']} intensity={0.65} />
      <Particles count={12} color="rgba(52,144,220,0.25)" />
      <BlurredOrb x={70} y={30} size={240} />
      <BlurredOrb x={20} y={60} size={180} color="rgba(52,144,220,0.1)" />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${cameraScale})`,
          opacity: dimO,
        }}
      >
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {/* Caption panel */}
          <GlassPanel enterDelay={46} fromRight={false} style={{ maxWidth: 300 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textBlack, marginBottom: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>
              Custom AI Videos
            </div>
            <div style={{ fontSize: 13, color: COLORS.textGray500, lineHeight: 1.6, fontFamily: 'Inter, system-ui, sans-serif' }}>
              Get a personalized educational video explanation for every question you ask.
            </div>
            {frame >= 66 && (
              <div style={{ marginTop: 12 }}>
                <WordByWord
                  text="educational video explanation"
                  startFrame={66}
                  staggerFrames={3}
                  fontSize={15}
                  fontWeight={600}
                  color={COLORS.bluePrimary}
                />
              </div>
            )}
          </GlassPanel>

          {/* Feature card with playback motif */}
          <div
            style={{
              transform: `translateX(${cardX}px) scale(${cardScale})`,
              opacity: cardO,
            }}
          >
            <FeatureCard
              title="AI Video Explanations"
              description="Watch AI-generated video breakdowns of your math problems. Visual learning made effortless."
              style={{ width: 400, padding: 36, position: 'relative' }}
            />
            {/* Progress bar motif */}
            <div
              style={{
                margin: '12px 36px 24px',
                height: 6,
                borderRadius: 3,
                background: 'rgba(52,144,220,0.1)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progressWidth}%`,
                  height: '100%',
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${COLORS.bluePrimary}, ${COLORS.bluePrimary90})`,
                  boxShadow: `0 0 12px rgba(52,144,220,${glowPulse * 0.5})`,
                }}
              />
            </div>
            {/* Pulsing diagram nodes */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, paddingBottom: 20 }}>
              {[0, 1, 2].map((i) => {
                const nodeSpring = spring({
                  frame: frame - (30 + i * 8),
                  fps,
                  config: { damping: 12, stiffness: 120 },
                });
                const pulse = interpolate(Math.sin((frame + i * 20) * 0.06), [-1, 1], [0.7, 1]);
                return (
                  <div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: COLORS.bluePrimary,
                      opacity: interpolate(nodeSpring, [0, 1], [0, pulse]),
                      transform: `scale(${nodeSpring})`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
