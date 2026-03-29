import { loadFont } from '@remotion/google-fonts/Outfit';

const { fontFamily, waitUntilDone } = loadFont('normal', {
  weights: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export const FONT_FAMILY = fontFamily;
export const fontReady = waitUntilDone;
