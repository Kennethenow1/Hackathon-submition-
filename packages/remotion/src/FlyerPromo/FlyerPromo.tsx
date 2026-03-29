import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { TransitionSeries } from '@remotion/transitions';
import { Scene1Hero } from './Scene1Hero';
import { Scene2SplitScreen } from './Scene2SplitScreen';
import { Scene3ProductReveal } from './Scene3ProductReveal';
import { Scene4CameraCapture } from './Scene4CameraCapture';
import { Scene5ProcessPhoto } from './Scene5ProcessPhoto';
import { Scene6CalendarConnect } from './Scene6CalendarConnect';
import { Scene7Success } from './Scene7Success';
import { Scene8CTA } from './Scene8CTA';

export const FLYER_PROMO_DURATION = 900;

// Scene durations (must sum to FLYER_PROMO_DURATION)
const S1_DUR = 90;   // 0-90
const S2_DUR = 120;  // 90-210
const S3_DUR = 150;  // 210-360
const S4_DUR = 120;  // 360-480
const S5_DUR = 150;  // 480-630
const S6_DUR = 120;  // 630-750
const S7_DUR = 90;   // 750-840
const S8_DUR = 60;   // 840-900
// Total: 90+120+150+120+150+120+90+60 = 900 ✓

/**
 * Light leak overlay component for transitions
 */
const LightLeakOverlay: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const half = durationInFrames / 2;
  const opacity = frame < half
    ? interpolate(frame, [0, half], [0, 0.7], { extrapolateRight: 'clamp' })
    : interpolate(frame, [half, durationInFrames], [0.7, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 60% 30%, rgba(255,220,150,0.6) 0%, rgba(255,180,80,0.3) 40%, transparent 70%)',
        opacity,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
  );
};

export const FlyerPromo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#f7f8fa', fontFamily: 'Outfit, sans-serif' }}>
      {/* Scene 1: Hero (frames 0-90) */}
      <Sequence from={0} durationInFrames={S1_DUR} premountFor={30}>
        <Scene1Hero />
      </Sequence>

      {/* Light leak transition 1→2 (frames 74-92) */}
      <Sequence from={74} durationInFrames={18} premountFor={0}>
        <LightLeakOverlay durationInFrames={18} />
      </Sequence>

      {/* Scene 2: Split screen (frames 90-210) */}
      <Sequence from={90} durationInFrames={S2_DUR} premountFor={30}>
        <Scene2SplitScreen />
      </Sequence>

      {/* Scene 3: Product reveal (frames 210-360) */}
      <Sequence from={210} durationInFrames={S3_DUR} premountFor={30}>
        <Scene3ProductReveal />
      </Sequence>

      {/* Scene 4: Camera capture (frames 360-480) */}
      <Sequence from={360} durationInFrames={S4_DUR} premountFor={20}>
        <Scene4CameraCapture />
      </Sequence>

      {/* Light leak transition 4→5 (frames 464-480) */}
      <Sequence from={464} durationInFrames={16} premountFor={0}>
        <LightLeakOverlay durationInFrames={16} />
      </Sequence>

      {/* Scene 5: Process photo (frames 480-630) */}
      <Sequence from={480} durationInFrames={S5_DUR} premountFor={20}>
        <Scene5ProcessPhoto />
      </Sequence>

      {/* Scene 6: Calendar connect (frames 630-750) */}
      <Sequence from={630} durationInFrames={S6_DUR} premountFor={20}>
        <Scene6CalendarConnect />
      </Sequence>

      {/* Scene 7: Success (frames 750-840) */}
      <Sequence from={750} durationInFrames={S7_DUR} premountFor={20}>
        <Scene7Success />
      </Sequence>

      {/* Light leak transition 7→8 (frames 832-847) */}
      <Sequence from={832} durationInFrames={15} premountFor={0}>
        <LightLeakOverlay durationInFrames={15} />
      </Sequence>

      {/* Scene 8: Closing CTA (frames 840-900) */}
      <Sequence from={840} durationInFrames={S8_DUR} premountFor={20}>
        <Scene8CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
