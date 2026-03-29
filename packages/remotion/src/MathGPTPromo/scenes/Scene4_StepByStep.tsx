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
import { OrbitRing } from '../helpers/OrbitRing';
import { GlassPanel } from '../helpers/GlassPanel';
import { HighlightSweep } from '../helpers/HighlightSweep';
import { FeatureCard } from '../helpers/FeatureCard';
import { COLORS } from '../constants';

export const Scene4_StepByStep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const duration = 150;

  // Zoom in
  const zoomScale = interpolate(frame, [0, 24], [1, 2.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Card shadow lift
  const cardLift = spring({ frame: frame - 14, fps, config: { damping: 16, stiffness: 70 } });
  const cardShadow = interpolate(cardLift, [0, 1], [6, 24]);
  const cardRotX = interpolate(cardLift, [0, 1], [4, 0]);

  // Step markers animation
  const steps = ['Break down the problem', 'Solve each part', 'Verify the answer'];

  // Camera drift
  const driftX = Math.sin(frame * 0.012) * 6;
  const driftY = Math.cos(frame * 0.01) * 4;

  // Glass panel exit
  const glassExit = interpolate(frame, [110, 140], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <GradientMeshBg colors={['#f9fafb', '#ffffff', '#3490dc', '#e5e7eb']} intensity={0.5} />
      <Particles count={10} color="rgba(52,144,220,0.22)" />
      <OrbitRing size={160} style={{ position: 'absolute', left: '50%', top: '40%', marginLeft: -80, marginTop: -80 }} speed={0.35} />

      <AbsoluteFill
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translate(${driftX}px, ${driftY}px)`,
        }}
      >
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {/* Feature card */}
          <div
            style={{
              transform: `rotateX(${cardRotX}deg)`,
              boxShadow: `0 ${cardShadow}px ${cardShadow * 2}px rgba(0,0,0,0.1)`,
              borderRadius: 20,
            }}
          >
            <FeatureCard
              title="Step-by-step Solutions"
              description="Every problem is broken down into clear, digestible steps so you understand the path to the answer."
              style={{ width: 380, padding: 36 }}
            />
            {/* Step markers */}
            <div style={{ padding: '16px 36px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {steps.map((step, i) => {
                const s = spring({
                  frame: frame - (56 + i * 12),
                  fps,
                  config: { damping: 14, stiffness: 100 },
                });
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      opacity: interpolate(s, [0, 1], [0, 1]),
                      transform: `translateX(${interpolate(s, [0, 1], [-20, 0])}px)`,
                      fontSize: 14,
                      color: COLORS.textGray700,
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: COLORS.bluePrimary,
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {i + 1}
                    </div>
                    {step}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Glass panel */}
          <div style={{ opacity: glassExit }}>
            <GlassPanel enterDelay={30} style={{ maxWidth: 320 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.textBlack, marginBottom: 8, fontFamily: 'Inter, system-ui, sans-serif' }}>
                Why it matters
              </div>
              <div style={{ fontSize: 13, color: COLORS.textGray500, lineHeight: 1.6, fontFamily: 'Inter, system-ui, sans-serif' }}>
                Understanding the process is more valuable than just getting the answer.
              </div>
              {frame >= 40 && (
                <div style={{ marginTop: 12 }}>
                  <HighlightSweep
                    text="clear, digestible steps"
                    startFrame={40}
                    fontSize={15}
                    fontWeight={600}
                    color="rgba(52,144,220,0.3)"
                  />
                </div>
              )}
            </GlassPanel>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
