import { loadFont as loadOutfit } from "@remotion/google-fonts/Outfit";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

const outfit = loadOutfit("normal", {
  weights: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const spaceGrotesk = loadSpaceGrotesk("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const outfitFamily = outfit.fontFamily;
export const spaceGroteskFamily = spaceGrotesk.fontFamily;
