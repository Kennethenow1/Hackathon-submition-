import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';

export const VoiceOver = () => {
  return (
    <>
      <Audio src={staticFile('voiceover/scene-01-intro.mp3')} />
      <Audio src={staticFile('voiceover/scene-02-main.mp3')} />
      <Audio src={staticFile('voiceover/scene-03-outro.mp3')} />
    </>
  );
};