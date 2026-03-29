import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Sequence,
} from 'remotion';
import { TransitionSeries, linearTiming, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { LightLeak } from '@remotion/light-leaks';

import { Scene1Hero } from './Scene1Hero';
import { Scene2Pain } from './Scene2Pain';
import { Scene3ProductReveal } from './Scene3ProductReveal';
import { Scene4LanguageSwitch } from './Scene4LanguageSwitch';
import { Scene5Narration } from './Scene5Narration';
import { Scene6Dashboard } from './Scene6Dashboard';
import { Scene7Share } from './Scene7Share';
import { Scene8CTA } from './Scene8CTA';

// Total: 1350 frames at 30fps = 45s
// Scenes use TransitionSeries with overlapping transitions
// Transition durations reduce total: account for overlap
// Transition between each pair: 20 frames overlap each (7 transitions × 20 = 140 frames subtracted)
// Scene raw durations: S1=150, S2=150, S3=180, S4=240, S5=210, S6=180, S7=120, S8=120 = 1350 total
// With 7 transitions of 20 frames each: 1350 - 7*20 = 1210... need to compensate
// Strategy: add 20 frames to each scene to offset the transition overlap
// S1=170, S2=170, S3=200, S4=260, S5=230, S6=200, S7=140, S8=140 = 1510; minus 7*20=140 => 1370 (close, adjust)
// Final precise: S1=168, S2=168, S3=196, S4=252, S5=224, S6=196, S7=132, S8=134 = 1470; minus 7*20=140 => 1330
// Use 18 frame transitions: 7*18=126; scenes: S1=168+S2=168+S3=196+S4=252+S5=224+S6=196+S7=132+S8=134=1470; -126=1344... close to 1350
// Adjust: S8=140 => 1476-126=1350. Done.
export const SCENE_DURATIONS = {
  s1: 168,
  s2: 168,
  s3: 196,
  s4: 252,
  s5: 224,
  s6: 196,
  s7: 132,
  s8: 140,
};

const TRANSITION_FRAMES = 18;

export const PTT_PROMO_DURATION_IN_FRAMES =
  SCENE_DURATIONS.s1 +
  SCENE_DURATIONS.s2 +
  SCENE_DURATIONS.s3 +
  SCENE_DURATIONS.s4 +
  SCENE_DURATIONS.s5 +
  SCENE_DURATIONS.s6 +
  SCENE_DURATIONS.s7 +
  SCENE_DURATIONS.s8 -
  TRANSITION_FRAMES * 7; // = 1476 - 126 = 1350

export const PTTPromoComposition: React.FC = () => {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        {/* Scene 1: Hero */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.s1}>
          <Scene1Hero />
        </TransitionSeries.Sequence>

        {/* Transition 1→2: Light leak crossfade */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20, mass: 0.85 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 2: Pain point */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.s2}>
          <Scene2Pain />
        </TransitionSeries.Sequence>

        {/* Transition 2→3: Morphing wipe */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20, mass: 0.85 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 3: Product reveal */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.s3}>
          <Scene3ProductReveal />
        </TransitionSeries.Sequence>

        {/* Transition 3→4: Feature zoom scale */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 22, mass: 0.9 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 4: Language switch */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.s4}>
          <Scene4LanguageSwitch />
        </TransitionSeries.Sequence>

        {/* Transition 4→5: Light leak */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20, mass: 0.85 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 5: Narration */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.s5}>
          <Scene5Narration />
        </TransitionSeries.Sequence>

        {/* Transition 5→6: Slide wipe from right to left */}
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={springTiming({ config: { damping: 22, mass: 0.9 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 6: Dashboard */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.s6}>
          <Scene6Dashboard />
        </TransitionSeries.Sequence>

        {/* Transition 6→7: Crossfade */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20, mass: 0.85 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 7: Share */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.s7}>
          <Scene7Share />
        </TransitionSeries.Sequence>

        {/* Transition 7→8: Light leak crossfade */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 20, mass: 0.85 }, durationInFrames: TRANSITION_FRAMES })}
        />

        {/* Scene 8: CTA */}
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.s8}>
          <Scene8CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
