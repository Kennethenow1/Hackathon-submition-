import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { staticFile } from 'remotion';

const WhooshSound = staticFile('whoosh.wav');
const ClickSound = staticFile('click.wav');
const RiserSound = staticFile('riser.wav');
const UpliftingMusic = staticFile('uplifting-music.mp3');

export const PromoVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      {/* Introduction */}
      <Sequence durationInFrames={150}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: interpolate(frame, [0, 150], [0, 1]) }}>
          <img src={staticFile('ptt-logo.png')} alt='PTT Logo' style={{ width: '300px', transform: `scale(${interpolate(frame, [0, 150], [0.5, 1])})` }} />
        </div>
        <audio src={WhooshSound} autoPlay />
      </Sequence>

      {/* Highlight features */}
      <Sequence from={150} durationInFrames={300}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', opacity: interpolate(frame - 150, [0, 300], [0, 1]) }}>
          <h1>Multilingual Capabilities</h1>
        </div>
        <audio src={ClickSound} autoPlay />
      </Sequence>

      {/* Show translation process */}
      <Sequence from={450} durationInFrames={300}>
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', opacity: interpolate(frame - 450, [0, 300], [0, 1]) }}>
          <h1>Translation in Action</h1>
        </div>
        <audio src={RiserSound} autoPlay />
      </Sequence>

      {/* Voice-over integration */}
      <Sequence from={750} durationInFrames={300}>
        <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)', opacity: interpolate(frame - 750, [0, 300], [0, 1]) }}>
          <h1>Seamless Voice-over Addition</h1>
        </div>
        <audio src={UpliftingMusic} autoPlay loop />
      </Sequence>

      {/* Showcase use cases */}
      <Sequence from={1050} durationInFrames={300}>
        <div style={{ position: 'absolute', top: '80%', left: '50%', transform: 'translate(-50%, -50%)', opacity: interpolate(frame - 1050, [0, 300], [0, 1]) }}>
          <h1>Real-World Applications</h1>
        </div>
      </Sequence>

      {/* Call to action */}
      <Sequence from={1350} durationInFrames={450}>
        <div style={{ position: 'absolute', top: '90%', left: '50%', transform: 'translate(-50%, -50%)', opacity: interpolate(frame - 1350, [0, 450], [0, 1]) }}>
          <h1>Join Us Today!</h1>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};