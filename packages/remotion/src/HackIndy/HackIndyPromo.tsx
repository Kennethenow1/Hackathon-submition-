import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { TS_SCENES, TRANSITION_FRAMES, TOTAL_DURATION_IN_FRAMES } from "./constants";
import { Scene1Hero } from "./Scene1Hero";
import { Scene2Compare } from "./Scene2Compare";
import { Scene3Homepage } from "./Scene3Homepage";
import { Scene4Schedule } from "./Scene4Schedule";
import { Scene5Prizes } from "./Scene5Prizes";
import { Scene6FAQ } from "./Scene6FAQ";
import { Scene7Judges } from "./Scene7Judges";
import { Scene8CTA } from "./Scene8CTA";

// Exported so Root.tsx can use it as the single source of truth
export const HACK_INDY_DURATION_IN_FRAMES = TOTAL_DURATION_IN_FRAMES;

const sceneComponents = [
  Scene1Hero,
  Scene2Compare,
  Scene3Homepage,
  Scene4Schedule,
  Scene5Prizes,
  Scene6FAQ,
  Scene7Judges,
  Scene8CTA,
];

const timing = springTiming({
  config: { damping: 22, mass: 0.9 },
  durationInFrames: TRANSITION_FRAMES,
});

export const HackIndyPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0d" }}>
      <TransitionSeries>
        {sceneComponents.map((SceneComp, i) => {
          const sceneConfig = TS_SCENES[i];
          const items: React.ReactNode[] = [];
          items.push(
            <TransitionSeries.Sequence
              key={`scene-${i}`}
              durationInFrames={sceneConfig.duration}
            >
              <SceneComp />
            </TransitionSeries.Sequence>
          );
          if (i < sceneComponents.length - 1) {
            items.push(
              <TransitionSeries.Transition
                key={`tr-${i}`}
                presentation={fade()}
                timing={timing}
              />
            );
          }
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
