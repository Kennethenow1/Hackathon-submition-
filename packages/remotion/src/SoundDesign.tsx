import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';

export const SoundDesign = () => {
  return (
    <>
      <Audio src={staticFile('sound/whoosh.wav')} />
      <Audio src={staticFile('sound/click.wav')} />
      <Audio src={staticFile('sound/ambient-rise.wav')} />
      <Audio src={staticFile('sound/background-music.mp3')} />
      <Audio src={staticFile('sound/crescendo.wav')} />
      <Audio src={staticFile('sound/chime.wav')} />
    </>
  );
};