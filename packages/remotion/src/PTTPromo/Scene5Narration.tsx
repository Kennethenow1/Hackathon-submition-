import React from 'react';
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  AbsoluteFill,
  Easing,
} from 'remotion';
import { BrowserFrame } from '../BrowserFrame';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { GlassCard } from './GlassCard';
import { PALETTE } from './palette';
import { CursorOverlay } from './CursorOverlay';
import { sineFloat } from './utils';

// Narration panel layout in browser content
const PLAY_BTN = { left: 480 + 100, top: 220, width: 100, height: 40 };
const BROWSER_W = 860;
const BROWSER_H = 480;

export const Scene5Narration: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame;

  // Panel slide in
  const panelSpring = spring({ frame: lf, fps, config: { damping: 16, stiffness: 80 } });
  const panelX = interpolate(panelSpring, [0, 1], [64, 0]);
  const panelOp = interpolate(panelSpring, [0, 1], [0, 1]);

  // Headline stagger
  const h1Op = interpolate(lf, [14, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const h1Y = interpolate(lf, [14, 34], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const h2Op = interpolate(lf, [22, 42], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const h2Y = interpolate(lf, [22, 42], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Progress bar fill (after click at frame 72)
  const progressFill = interpolate(lf, [72, 126], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Camera drift to slide area
  const camX = interpolate(lf, [96, 156], [0, -40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Speaker pulse rings
  const pulse1 = interpolate(Math.sin(lf * 0.12), [-1, 1], [0.5, 1.0]);
  const pulse2 = interpolate(Math.sin(lf * 0.08 + 1.2), [-1, 1], [0.3, 0.8]);

  // Waveform bars
  const waveBarCount = 20;
  const playing = lf >= 72;

  // Language badge chips
  const chips = ['🇪🇸 Español', '🇫🇷 Français', '🇯🇵 日本語'];

  // Exit shift
  const exitY = interpolate(lf, [162, 180], [0, -8], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const exitOp = interpolate(lf, [162, 180], [1, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Float
  const floatY = sineFloat(lf, 3, 130, 0);

  // Cursor
  const cursorPoints = [
    { x: PLAY_BTN.left - 480 + 480 + 40, y: PLAY_BTN.top - 20, frame: 54 },
    { x: PLAY_BTN.left - 480 + 480, y: PLAY_BTN.top + PLAY_BTN.height / 2, frame: 72, click: true },
  ];
  // Adjust cursor to be relative to browser content
  const adjustedCursor = [
    { x: 480 + 100 + 40, y: 220 - 20, frame: 54 },
    { x: 480 + 100 + 50, y: 220 + 20, frame: 72, click: true },
  ];

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '"DM Sans", sans-serif', opacity: exitOp }}>
      <AbsoluteFill style={{ transform: `translateY(${exitY}px)` }}>
        {/* Background */}
        <GradientMeshBg
          colors={[PALETTE.bg, PALETTE.bgSecondary, PALETTE.primary, PALETTE.brandAccent]}
          baseColor={PALETTE.bg}
        />

        {/* Particles */}
        <Particles count={16} colors={['rgba(234,215,102,0.4)', 'rgba(107,124,61,0.28)']} width={1920} height={1080} />

        {/* Orb */}
        <div style={{
          position: 'absolute', right: '10%', top: '15%',
          width: 220, height: 220, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(234,215,102,0.2) 0%, transparent 70%)`,
          filter: 'blur(45px)',
          transform: `translateY(${sineFloat(lf, 12, 140, 0)}px)`,
        }} />

        {/* Camera drift */}
        <AbsoluteFill style={{ transform: `translateX(${camX}px)` }}>
          {/* Browser */}
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: `translate(-50%,-50%) translateY(${floatY}px)`,
          }}>
            <BrowserFrame url="ptt.app/editor/narrate" width={BROWSER_W} shadow={true}>
              <div style={{
                width: BROWSER_W,
                height: BROWSER_H,
                background: PALETTE.bg,
                display: 'flex',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Slide preview - left 60% */}
                <div style={{
                  width: BROWSER_W * 0.58,
                  padding: 24,
                  borderRight: `1px solid rgba(107,124,61,0.14)`,
                  display: 'flex', flexDirection: 'column',
                  background: 'rgba(250,245,217,0.4)',
                }}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, fontWeight: 600, marginBottom: 12 }}>Slide Preview</div>
                  <div style={{
                    flex: 1,
                    borderRadius: 10,
                    background: PALETTE.bg,
                    border: `1px solid rgba(107,124,61,0.2)`,
                    padding: 20,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: 20, fontFamily: '"DM Serif Display", serif', fontWeight: 700, color: PALETTE.text, marginBottom: 12 }}>Estrategia Global T4</div>
                    {['Ampliando el alcance en Europa y Asia.', 'Objetivo de ingresos: +32% de crecimiento.', 'Iniciativa clave: alcance multilingüe.'].map((line, i) => (
                      <div key={i} style={{ fontSize: 12, color: PALETTE.textMuted, marginBottom: 8, paddingLeft: 10, borderLeft: '2px solid rgba(107,124,61,0.28)' }}>{line}</div>
                    ))}
                  </div>

                  {/* Audio waveform */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 10, color: PALETTE.textMuted, marginBottom: 6 }}>Voice-over track</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 32 }}>
                      {Array.from({ length: waveBarCount }, (_, i) => {
                        const barH = playing
                          ? 6 + Math.abs(Math.sin(lf * 0.18 + i * 0.6)) * 22
                          : 8;
                        return (
                          <div key={i} style={{
                            flex: 1, height: barH,
                            background: `linear-gradient(180deg, ${PALETTE.primary}, ${PALETTE.brandAccent})`,
                            borderRadius: 2,
                            opacity: playing ? 0.7 + Math.sin(lf * 0.12 + i * 0.4) * 0.3 : 0.3,
                          }} />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Narration panel - right 40% */}
                <div style={{
                  width: BROWSER_W * 0.42,
                  padding: 20,
                  transform: `translateX(${panelX}px)`,
                  opacity: panelOp,
                  display: 'flex', flexDirection: 'column', gap: 16,
                }}>
                  <div style={{ opacity: h1Op, transform: `translateY(${h1Y}px)` }}>
                    <div style={{ fontSize: 13, fontFamily: '"DM Serif Display", serif', fontWeight: 700, color: PALETTE.brandAccent, marginBottom: 4 }}>Voice-Over</div>
                    <div style={{ fontSize: 11, color: PALETTE.textMuted, lineHeight: 1.5 }}>Generated narration in the target language.</div>
                  </div>

                  {/* Language selector */}
                  <div style={{ opacity: h2Op, transform: `translateY(${h2Y}px)` }}>
                    <div style={{ fontSize: 11, color: PALETTE.textMuted, marginBottom: 6 }}>Narration language</div>
                    <div style={{
                      padding: '8px 12px', borderRadius: 8,
                      border: `1px solid rgba(107,124,61,0.3)`,
                      background: 'rgba(107,124,61,0.08)',
                      fontSize: 12, fontWeight: 600, color: PALETTE.brandAccent,
                    }}>🇪🇸 Español</div>
                  </div>

                  {/* Play/generate button with speaker area */}
                  <div style={{ position: 'relative' }}>
                    {/* Speaker pulse rings */}
                    <div style={{
                      position: 'absolute', left: 50, top: 20,
                      width: 60, height: 60,
                      borderRadius: '50%',
                      border: `1.5px solid rgba(107,124,61,${pulse1 * 0.4})`,
                      transform: `translate(-50%,-50%) scale(${1 + pulse1 * 0.3})`,
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      position: 'absolute', left: 50, top: 20,
                      width: 80, height: 80,
                      borderRadius: '50%',
                      border: `1px solid rgba(107,124,61,${pulse2 * 0.25})`,
                      transform: `translate(-50%,-50%) scale(${1 + pulse2 * 0.5})`,
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', borderRadius: 10,
                      background: PALETTE.brandAccent,
                      color: '#fff', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', width: 'fit-content',
                    }}>
                      <span style={{ fontSize: 16 }}>{playing ? '▶' : '▶'}</span>
                      <span>{playing ? 'Generating...' : 'Generate Voice-Over'}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: PALETTE.textMuted, marginBottom: 4 }}>
                      <span>Progress</span>
                      <span>{Math.round(progressFill)}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(107,124,61,0.12)' }}>
                      <div style={{
                        width: `${progressFill}%`, height: '100%', borderRadius: 3,
                        background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.brandAccent})`,
                      }} />
                    </div>
                  </div>

                  {/* Language chips */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {chips.map((chip, i) => {
                      const chipS = spring({ frame: lf - (156 + i * 8), fps, config: { damping: 14, stiffness: 100 } });
                      return (
                        <div key={i} style={{
                          opacity: chipS,
                          transform: `translateY(${interpolate(chipS, [0, 1], [8, 0])}px)`,
                          padding: '5px 10px', borderRadius: 8,
                          background: 'rgba(107,124,61,0.08)',
                          border: `1px solid rgba(107,124,61,0.22)`,
                          fontSize: 11, color: PALETTE.textMuted,
                        }}>{chip}</div>
                      );
                    })}
                  </div>
                </div>

                {/* Cursor overlay */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <CursorOverlay points={adjustedCursor} />
                </div>
              </div>
            </BrowserFrame>
          </div>
        </AbsoluteFill>

        {/* Glass label panel */}
        <div style={{
          position: 'absolute',
          left: 80, top: '50%',
          transform: `translateY(-50%)`,
          opacity: panelOp,
        }}>
          <GlassCard style={{ padding: '18px 24px', maxWidth: 220 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: PALETTE.brandAccent, fontWeight: 700, marginBottom: 6 }}>Narration</div>
            <div style={{ fontSize: 17, fontFamily: '"DM Serif Display", serif', fontWeight: 700, color: PALETTE.text, lineHeight: 1.25 }}>Add voice-overs in the target language.</div>
          </GlassCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
