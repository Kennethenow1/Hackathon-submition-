import { Composition } from "remotion";
import {
  HackIndyPromo,
  HACK_INDY_DURATION_IN_FRAMES,
} from "./HackIndy/HackIndyPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HackIndy2026Promo"
        component={HackIndyPromo}
        durationInFrames={HACK_INDY_DURATION_IN_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
