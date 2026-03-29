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
import { GradientMeshBg } from '../helpers/GradientMeshBg';
import { Particles } from '../helpers/Particles';
import { BlurredOrb } from '../helpers/BlurredOrb';
import { WordByWord } from '../helpers/WordByWord';
import { HighlightSweep } from '../helpers/HighlightSweep';
import { MockHomepage } from '../helpers/MockHomepage';
import { COLORS } from '../constants';

export const Scene1_BrandHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // BG fade
  const bgOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const bgScale = interpolate(frame, [0, 18], [1.06, 1.0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // Logo
  const logoSpring = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.7, 1]);
  const logoY = interpolate(logoSpring, [0, 1], [24, 0]);

  // Subheadline
  const subEnter = spring({ frame: frame - 26, fps, config: { damping: 18, stiffness: 80 } });
  const subY = interpolate(subEnter, [0, 1], [20, 0]);
  const subO = interpolate(subEnter, [0, 1], [0, 1]);

  // FloatingBrowser
  const browserSpring = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 55, mass: 1.2 } });
  const browserY = interpolate(browserSpring, [0, 1], [120, 0]);
  const browserScale = interpolate(browserSpring, [0, 1], [0.68, 0.78]);
  const browserO = interpolate(browserSpring, [0, 1], [0, 1]);

  // Gentle drift after landing
  const driftY = frame > 54 ? Math.sin(frame * 0.015) * 3 : 0;
  const driftRotate = frame > 54 ? Math.sin(frame * 0.02) * 1.5 : 0;

  // Camera push-in
  const cameraScale = interpolate(frame, [54, 108], [1.0, 1.04], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  // Highlight sweep on "Math Solver" near end
  const showHighlight = frame >= 92;

  // Exit fade
  const exitO = interpolate(frame, [100, 120], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      <div style={{ opacity: bgOpacity, transform: `scale(${bgScale})`, width: '100%', height: '100%' }}>
        <GradientMeshBg colors={['#3490dc', '#f1f3f5', '#ffffff', '#e5e7eb']} />
      </div>
      <Particles count={14} color="rgba(52,144,220,0.3)" />
      <BlurredOrb x={15} y={25} size={260} />
      <BlurredOrb x={78} y={65} size={200} color="rgba(52,144,220,0.12)" />

      <AbsoluteFill style={{ transform: `scale(${cameraScale})`, opacity: exitO }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            gap: 60,
            padding: '0 80px',
          }}
        >
          {/* Left: text block */}
          <div style={{ flex: '0 0 48%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Logo */}
            <div
              style={{
                transform: `scale(${logoScale}) translateY(${logoY}px)`,
                opacity: logoSpring,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: COLORS.bluePrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                M
              </div>
            </div>
            {showHighlight ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <WordByWord
                  text="MathGPT - Your Personal"
                  startFrame={12}
                  fontSize={52}
                  color={COLORS.textBlack}
                  fontWeight={400}
                />
                <HighlightSweep
                  text="Math Solver"
                  startFrame={92}
                  fontSize={52}
                  fontWeight={400}
                  color="rgba(52,144,220,0.25)"
                />
              </div>
            ) : (
              <WordByWord
                text="MathGPT - Your Personal Math Solver"
                startFrame={12}
                fontSize={52}
                color={COLORS.textBlack}
                fontWeight={400}
              />
            )}
            <div
              style={{
                transform: `translateY(${subY}px)`,
                opacity: subO,
                fontSize: 18,
                color: COLORS.textGray700,
                fontFamily: 'Inter, system-ui, sans-serif',
                lineHeight: 1.5,
              }}
            >
              Get instant homework help from your on-demand AI math solver
            </div>
          </div>

          {/* Right: browser */}
          <div
            style={{
              flex: '0 0 48%',
              transform: `translateY(${browserY + driftY}px) scale(${browserScale})`,
              opacity: browserO,
              perspective: 1200,
            }}
          >
            <div
              style={{
                transform: `rotateX(${-6 + driftRotate}deg) rotateY(${10 - driftRotate * 0.5}deg)`,
                transformStyle: 'preserve-3d',
                boxShadow: '0 40px 80px -20px rgba(0,0,0,0.25)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <FloatingBrowser
                url="math-gpt.org"
                width={560}
                rotateX={0}
                rotateY={0}
                scale={1}
                enterDelay={0}
                durationInFrames={120}
              >
                <MockHomepage width={560} />
              </FloatingBrowser>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
