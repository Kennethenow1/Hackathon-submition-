import React from "react";
import { Composition } from "remotion";
import { FlyerPromo, FLYER_COMP_DURATION_IN_FRAMES } from "./FlyerPromo/index";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="FlyerPromo"
      component={FlyerPromo}
      durationInFrames={FLYER_COMP_DURATION_IN_FRAMES}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
