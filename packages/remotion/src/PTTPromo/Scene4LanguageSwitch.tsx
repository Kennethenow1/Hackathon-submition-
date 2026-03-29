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
import { PALETTE, BRAND_ACCENT_RGB } from './palette';
import { CursorOverlay } from './CursorOverlay';
import { sineFloat } from './utils';

const LANGS = ['English', 'Español', 'Français', '日本語', 'Deutsch', 'Italiano'];

const SLIDE_CONTENT_EN = [
  { type: 'title', text: 'Q4 Global Strategy' },
  { type: 'body', text: 'Expanding market reach across Europe and Asia.' },
  { type: 'body', text: 'Revenue target: +32% YoY growth.' },
  { type: 'body', text: 'Key initiative: multilingual outreach.' },
];

const SLIDE_CONTENT_ES = [
  { type: 'title', text: 'Estrategia Global T4' },
  { type: 'body', text: 'Ampliando el alcance en Europa y Asia.' },
  { type: 'body', text: 'Objetivo de ingresos: +32% de crecimiento anual.' },
  { type: 'body', text: 'Iniciativa clave: alcance multilingüe.' },
];

// Layout: language selector box in browser content area
const LANG_SELECTOR = { left: 540, top: 30, width: 180, height: 36 };
const LANG_OPTION_2 = { left: 540, top: 106, width: 180, height: 36 }; // Español option

export const Scene4LanguageSwitch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lf = frame;

  // Content transition: show ES after frame 138 (618-480)
  const langSwitched = lf >= 138;
  const slideContent = langSwitched ? SLIDE_CONTENT_ES : SLIDE_CONTENT_EN;

  // Text swap progress for smooth cross-fade swap
  const swapProgress = interpolate(lf, [138, 162], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });
  const enOpacity = interpolate(swapProgress, [0, 0.5], [1, 0], { extrapolateRight: 'clamp' });
  const esOpacity = interpolate(swapProgress, [0.5, 1], [0, 1], { extrapolateLeft: 'clamp' });

  // Camera push-in on slide
  const cameraScale = interpolate(lf, [192, 228], [1.0, 1.08], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad) });

  // Dropdown open/close
  const dropdownOpen = lf >= 78 && lf < 138; // frame 558-600 relative: 78-120, option click 120
  const dropdownProgress = interpolate(lf, [78, 96], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Label panel
  const labelSpring = spring({ frame: lf - 12, fps, config: { damping: 14, stiffness: 80 } });
  const labelX = interpolate(labelSpring, [0, 1], [36, 0]);
  const labelOp = interpolate(labelSpring, [0, 1], [0, 1]);

  // Text highlight sweep on translated title
  const highlightSweep = interpolate(lf, [168, 196], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  // Language badge ring pulse
  const ringPulse1 = interpolate(Math.sin(lf * 0.12), [-1, 1], [0.4, 1.0]);
  const ringPulse2 = interpolate(Math.sin(lf * 0.09 + 1), [-1, 1], [0.3, 0.8]);

  // Float
  const floatY = sineFloat(lf, 4, 120, 0);

  // Cursor points (local to browser content area)
  const cursorPoints = [
    { x: LANG_SELECTOR.left + LANG_SELECTOR.width / 2 + 40, y: LANG_SELECTOR.top + LANG_SELECTOR.height / 2 - 30, frame: 42 },
    { x: LANG_SELECTOR.left + LANG_SELECTOR.width / 2, y: LANG_SELECTOR.top + LANG_SELECTOR.height / 2, frame: 78 },
    { x: LANG_SELECTOR.left + LANG_SELECTOR.width / 2, y: LANG_SELECTOR.top + LANG_SELECTOR.height / 2, frame: 78, click: true },
    { x: LANG_OPTION_2.left + LANG_OPTION_2.width / 2, y: LANG_OPTION_2.top + LANG_OPTION_2.height / 2, frame: 120 },
    { x: LANG_OPTION_2.left + LANG_OPTION_2.width / 2, y: LANG_OPTION_2.top + LANG_OPTION_2.height / 2, frame: 120, click: true },
  ];

  // Orbit ring
  const ringRot = lf * 0.35;

  return (
    <AbsoluteFill style={{ overflow: 'hidden', fontFamily: '"DM Sans", sans-serif' }}>
      {/* Background */}
      <GradientMeshBg
        colors={[PALETTE.brandAccent, PALETTE.accent, PALETTE.secondary, PALETTE.bg]}
        baseColor={PALETTE.bgSecondary}
      />

      {/* Particles */}
      <Particles
        count={24}
        colors={['rgba(234,215,102,0.5)', 'rgba(107,124,61,0.35)', 'rgba(176,162,77,0.4)']}
        width={1920} height={1080}
      />

      {/* Orbit ring */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%,-50%) rotate(${ringRot}deg)`,
        opacity: 0.13,
        pointerEvents: 'none',
      }}>
        <svg width="700" height="700">
          <circle cx="350" cy="350" r="320" fill="none" stroke={PALETTE.brandAccent} strokeWidth="1" strokeDasharray="10 16" />
        </svg>
      </div>

      {/* Upper-right blurred orb */}
      <div style={{
        position: 'absolute', right: '5%', top: '8%',
        width: 260, height: 260, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(234,215,102,0.28) 0%, transparent 70%)`,
        filter: 'blur(50px)',
        transform: `translateY(${sineFloat(lf, 14, 140, 0)}px)`,
      }} />

      {/* Camera wrapper */}
      <AbsoluteFill style={{
        transform: `scale(${cameraScale})`,
        transformOrigin: '50% 50%',
      }}>
        {/* Browser frame */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: `translate(-50%,-50%) translateY(${floatY}px)`,
        }}>
          <BrowserFrame url="ptt.app/editor" width={860} shadow={true}>
            <div style={{
              width: 860,
              height: 480,
              background: PALETTE.bg,
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Diagonal texture */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `repeating-linear-gradient(45deg, rgba(107,124,61,0.04) 0px, rgba(107,124,61,0.04) 1px, transparent 1px, transparent 28px)`,
                backgroundSize: '28px 28px',
              }} />

              {/* Top toolbar */}
              <div style={{
                height: 48, display: 'flex', alignItems: 'center', padding: '0 16px',
                background: 'rgba(253,251,240,0.95)', borderBottom: `1px solid rgba(107,124,61,0.16)`,
                justifyContent: 'space-between', gap: 12,
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ fontFamily: '"DM Serif Display", serif', fontSize: 15, fontWeight: 700, color: PALETTE.brandAccent }}>PTT</div>
                  <div style={{ width: 1, height: 20, background: 'rgba(107,124,61,0.2)' }} />
                  <div style={{ fontSize: 12, color: PALETTE.textMuted }}>Q4 Global Strategy.pptx</div>
                </div>
                {/* Language selector */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 8,
                    border: `1px solid rgba(107,124,61,0.35)`,
                    background: 'rgba(107,124,61,0.08)',
                    fontSize: 12, fontWeight: 600, color: PALETTE.brandAccent,
                    cursor: 'pointer', minWidth: LANG_SELECTOR.width,
                    justifyContent: 'space-between',
                  }}>
                    <span>{langSwitched ? '🇪🇸 Español' : '🇬🇧 English'}</span>
                    <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
                  </div>
                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '110%', right: 0,
                      width: LANG_SELECTOR.width,
                      background: 'rgba(253,251,240,0.98)',
                      border: `1px solid rgba(107,124,61,0.28)`,
                      borderRadius: 10,
                      boxShadow: `0 8px 24px rgba(0,0,0,0.1)`,
                      zIndex: 100,
                      overflow: 'hidden',
                    }}>
                      {LANGS.map((lang, i) => {
                        const itemS = spring({ frame: lf - 78 - i * 6, fps, config: { damping: 14, stiffness: 100 } });
                        const itemY = interpolate(itemS, [0, 1], [10, 0]);
                        const itemOp = interpolate(itemS, [0, 1], [0, 1]);
                        return (
                          <div key={i} style={{
                            padding: '8px 12px',
                            fontSize: 12,
                            color: i === 1 ? PALETTE.brandAccent : PALETTE.textMuted,
                            background: i === 1 ? 'rgba(107,124,61,0.1)' : 'transparent',
                            fontWeight: i === 1 ? 600 : 400,
                            transform: `translateY(${itemY}px)`,
                            opacity: itemOp,
                          }}>{lang}</div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: PALETTE.textMuted }}>Slide 1 of 8</div>
              </div>

              {/* Slide preview area */}
              <div style={{
                display: 'flex',
                height: 432,
              }}>
                {/* Slide list sidebar */}
                <div style={{
                  width: 120, padding: 8,
                  background: 'rgba(250,245,217,0.6)',
                  borderRight: `1px solid rgba(107,124,61,0.12)`,
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {[1, 2, 3].map(n => (
                    <div key={n} style={{
                      height: 60, borderRadius: 6,
                      background: n === 1 ? 'rgba(107,124,61,0.12)' : 'rgba(107,124,61,0.06)',
                      border: n === 1 ? `1px solid rgba(107,124,61,0.35)` : `1px solid rgba(107,124,61,0.1)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: PALETTE.textMuted,
                    }}>Slide {n}</div>
                  ))}
                </div>

                {/* Main slide content */}
                <div style={{
                  flex: 1, padding: 32, display: 'flex', flexDirection: 'column',
                  position: 'relative',
                }}>
                  {/* EN content */}
                  <div style={{ position: 'absolute', inset: 32, opacity: langSwitched ? enOpacity : 1 }}>
                    <div style={{
                      fontSize: 26, fontFamily: '"DM Serif Display", serif',
                      fontWeight: 700, color: PALETTE.text, marginBottom: 20,
                    }}>{SLIDE_CONTENT_EN[0].text}</div>
                    {SLIDE_CONTENT_EN.slice(1).map((item, i) => (
                      <div key={i} style={{
                        fontSize: 14, color: PALETTE.textMuted, marginBottom: 10,
                        paddingLeft: 12, borderLeft: `2px solid rgba(107,124,61,0.3)`,
                      }}>{item.text}</div>
                    ))}
                  </div>

                  {/* ES content */}
                  {langSwitched && (
                    <div style={{ position: 'absolute', inset: 32, opacity: esOpacity }}>
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                        <div style={{
                          position: 'absolute', bottom: 2, left: 0,
                          height: '35%',
                          width: `${highlightSweep}%`,
                          background: 'rgba(212,194,92,0.35)',
                          borderRadius: 4,
                        }} />
                        <div style={{
                          fontSize: 26, fontFamily: '"DM Serif Display", serif',
                          fontWeight: 700, color: PALETTE.text,
                          position: 'relative',
                        }}>{SLIDE_CONTENT_ES[0].text}</div>
                      </div>
                      {SLIDE_CONTENT_ES.slice(1).map((item, i) => (
                        <div key={i} style={{
                          fontSize: 14, color: PALETTE.textMuted, marginBottom: 10,
                          paddingLeft: 12, borderLeft: `2px solid rgba(107,124,61,0.35)`,
                        }}>{item.text}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cursor overlay */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <CursorOverlay points={cursorPoints} />
              </div>
            </div>
          </BrowserFrame>
        </div>

        {/* Glass label panel - right side */}
        <div style={{
          position: 'absolute',
          right: 80, top: '50%',
          transform: `translateY(-50%) translateX(${labelX}px)`,
          opacity: labelOp,
        }}>
          <GlassCard style={{ padding: '20px 28px', maxWidth: 240 }}>
            <div style={{
              fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
              color: PALETTE.brandAccent, fontWeight: 700, marginBottom: 8,
            }}>Instant Switch</div>
            <div style={{
              fontSize: 20, fontFamily: '"DM Serif Display", serif',
              fontWeight: 700, color: PALETTE.text, lineHeight: 1.2, marginBottom: 8,
            }}>Switch slides instantly.</div>
            <div style={{ fontSize: 12, color: PALETTE.textMuted, lineHeight: 1.5 }}>Formatting and structure are fully preserved across every language.</div>
            {/* Language badge */}
            {langSwitched && (
              <div style={{
                marginTop: 12,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 8,
                background: 'rgba(107,124,61,0.12)',
                border: `1px solid rgba(107,124,61,0.3)`,
                position: 'relative',
              }}>
                {/* Pulse ring */}
                <div style={{
                  position: 'absolute', inset: -3, borderRadius: 10,
                  border: `1.5px solid rgba(107,124,61,${ringPulse1 * 0.5})`,
                  pointerEvents: 'none',
                }} />
                <span style={{ fontSize: 14 }}>🇪🇸</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: PALETTE.brandAccent }}>Español active</span>
              </div>
            )}
          </GlassCard>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
