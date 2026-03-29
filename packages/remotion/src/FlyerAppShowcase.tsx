import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';

export const FlyerAppShowcase = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* Scene 1: Intro with app welcome message */}
      <Sequence from={0 * fps} durationInFrames={120}>
        <div style={{ backgroundColor: 'black', color: 'white', fontSize: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          Welcome to Flyer!
        </div>
      </Sequence>

      {/* Scene 2: Demonstration of uploading files */}
      <Sequence from={150} durationInFrames={150}>
        <div style={{ backgroundColor: 'lightgray', fontSize: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          Upload your files here.
        </div>
      </Sequence>

      {/* Scene 3: Highlight instant detail extraction */}
      <Sequence from={330} durationInFrames={150}>
        <div style={{ backgroundColor: 'white', fontSize: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          Instant detail extraction in progress...
        </div>
      </Sequence>

      {/* Scene 4: Show Google Calendar integration */}
      <Sequence from={510} durationInFrames={150}>
        <div style={{ backgroundColor: 'lightblue', fontSize: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          Google Calendar integration successful!
        </div>
      </Sequence>

      {/* Scene 5: Call to action for donations */}
      <Sequence from={690} durationInFrames={150}>
        <div style={{ backgroundColor: 'pink', fontSize: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          Support us with your donations!
        </div>
      </Sequence>

      {/* Scene 6: Closing message about Flyer */}
      <Sequence from={870} durationInFrames={150}>
        <div style={{ backgroundColor: 'black', color: 'white', fontSize: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          Thank you for using Flyer!
        </div>
      </Sequence>

      {/* Outro with upbeat music */}
      <Sequence from={1050} durationInFrames={750}>
        <div style={{ backgroundColor: 'white', fontSize: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          Enjoy our cheerful music!
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};