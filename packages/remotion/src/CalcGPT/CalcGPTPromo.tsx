import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Scene1Hero } from './scenes/Scene1Hero';
import { Scene2Problem } from './scenes/Scene2Problem';
import { Scene3ProductReveal } from './scenes/Scene3ProductReveal';
import { Scene4Notebook } from './scenes/Scene4Notebook';
import { Scene5CheckWork } from './scenes/Scene5CheckWork';
import { Scene6Desmos } from './scenes/Scene6Desmos';
import { Scene7Tutor } from './scenes/Scene7Tutor';
import { Scene8LearningTools } from './scenes/Scene8LearningTools';
import { Scene9Trust } from './scenes/Scene9Trust';
import { Scene10CTA } from './scenes/Scene10CTA';

/*
 * TransitionSeries: longer crossfades + springTiming (smoother than short linear fades / slides).
 * Total composition = sum(SCENE_DURATIONS) - 9 * TRANSITION_DURATION = 1200 frames @ 30fps.
 */

const TRANSITION_DURATION = 26;
const TRANSITION_COUNT = 9;

const SCENE_DURATIONS = [
  146, // Scene 1 (+8 vs base 138 — pays for longer overlaps)
  146, // Scene 2
  146, // Scene 3
  206, // Scene 4 (+8 vs 198)
  146, // Scene 5
  146, // Scene 6
  146, // Scene 7
  176, // Scene 8 (+8 vs 168)
  107, // Scene 9 (+8 vs 99)
  69,  // Scene 10
];

const transitionTiming = springTiming({
  config: { damping: 22, mass: 0.92 },
  durationInFrames: TRANSITION_DURATION,
});

export const CALC_GPT_DURATION =
  SCENE_DURATIONS.reduce((a, b) => a + b, 0) - TRANSITION_COUNT * TRANSITION_DURATION;

export const CalcGPTPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#0a0a0a' }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[0]}>
          <Scene1Hero />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[1]}>
          <Scene2Problem />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[2]}>
          <Scene3ProductReveal />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[3]}>
          <Scene4Notebook />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[4]}>
          <Scene5CheckWork />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[5]}>
          <Scene6Desmos />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[6]}>
          <Scene7Tutor />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[7]}>
          <Scene8LearningTools />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[8]}>
          <Scene9Trust />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition presentation={fade()} timing={transitionTiming} />

        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS[9]}>
          <Scene10CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
