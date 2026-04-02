import React, {CSSProperties, useMemo} from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Outfit';
import {LightLeak} from '@remotion/light-leaks';
import {BrowserFrame, FloatingBrowser} from './BrowserFrame';
import {arrowTipOffsetPx, CURSOR_ARROW_PATH_D} from './cursorTipOffset';

const {fontFamily} = loadFont('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export type FlyerPromoProps = {
  brand?: string;
  title?: string;
  subtitle?: string;
  url?: string;
};

const fullVideoDuration = 2100;
export const FLYER_COMP_DURATION_IN_FRAMES = fullVideoDuration;

const cardShadow = '0 18px 40px -12px rgba(0,0,0,0.22)';
const uiShadow = '0 24px 60px rgba(15,23,42,0.12)';
const glassStyle: CSSProperties = {
  backdropFilter: 'blur(16px)',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 18px 40px -12px rgba(0,0,0,0.22)',
};

const sceneStyleBase: CSSProperties = {
  fontFamily,
  color: '#0f172a',
  overflow: 'hidden',
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const makeExit = (frame: number, durationInFrames: number) => {
  const start = durationInFrames - 20;
  const progress = interpolate(frame, [start, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  return {
    opacity: 1 - progress,
    scale: interpolate(progress, [0, 1], [1, 0.965]),
  };
};

const MeshBackground: React.FC<{
  colors?: string[];
  base?: string;
  frameOffset?: number;
}> = ({colors = ['#0f172a', '#1d4ed8', '#7c3aed', '#22c55e'], base = '#0b1020', frameOffset = 0}) => {
  const frame = useCurrentFrame() + frameOffset;
  const p1x = 50 + Math.sin(frame * 0.01) * 18;
  const p1y = 35 + Math.cos(frame * 0.008) * 14;
  const p2x = 24 + Math.cos(frame * 0.012) * 22;
  const p2y = 70 + Math.sin(frame * 0.009) * 14;
  const p3x = 78 + Math.sin(frame * 0.015) * 12;
  const p3y = 28 + Math.cos(frame * 0.01) * 12;
  const p4x = 52 + Math.cos(frame * 0.013) * 20;
  const p4y = 76 + Math.sin(frame * 0.012) * 10;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: -120,
          background: `
            radial-gradient(ellipse 85% 60% at ${p1x}% ${p1y}%, ${colors[0]}dd 0%, transparent 65%),
            radial-gradient(ellipse 75% 70% at ${p2x}% ${p2y}%, ${colors[1]}aa 0%, transparent 64%),
            radial-gradient(ellipse 70% 75% at ${p3x}% ${p3y}%, ${colors[2]}88 0%, transparent 60%),
            radial-gradient(ellipse 60% 65% at ${p4x}% ${p4y}%, ${colors[3]}66 0%, transparent 62%),
            linear-gradient(135deg, ${base} 0%, #111827 100%)
          `,
        }}
      />
    </AbsoluteFill>
  );
};

const SoftGradientBackground: React.FC<{
  from?: string;
  to?: string;
  wash?: string;
}> = ({from = '#f8fafc', to = '#e2e8f0', wash = '#dbeafe'}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at ${18 + Math.sin(frame * 0.01) * 5}% ${18 + Math.cos(frame * 0.012) * 4}%, ${wash} 0%, transparent 30%), linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Particles: React.FC<{
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  opacity?: number;
}> = ({count = 12, color = '255,255,255', minSize = 3, maxSize = 10, opacity = 0.22}) => {
  const frame = useCurrentFrame();
  const particles = useMemo(() => {
    return new Array(count).fill(true).map((_, i) => {
      const seed = i + 1;
      return {
        x: ((seed * 91) % 100) + 0.2,
        y: ((seed * 53) % 100) + 0.2,
        size: minSize + ((seed * 19) % (maxSize - minSize + 1)),
        speedX: ((seed % 5) - 2) * 0.12,
        speedY: ((seed % 7) - 3) * 0.18,
      };
    });
  }, [count, minSize, maxSize]);

  return (
    <AbsoluteFill>
      {particles.map((p, i) => {
        const dx = Math.sin(frame * 0.02 + i) * 18 + frame * p.speedX;
        const dy = Math.cos(frame * 0.018 + i * 1.2) * 18 + frame * p.speedY;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `rgba(${color},${opacity})`,
              transform: `translate(${dx}px, ${dy}px)`,
              filter: 'blur(0.6px)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const Orb: React.FC<{
  x?: string;
  y?: string;
  size?: number;
  color?: string;
  blur?: number;
  opacity?: number;
}> = ({x = '70%', y = '30%', size = 280, color = '#60a5fa', blur = 40, opacity = 0.28}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        opacity,
        transform: `translate(-50%, -50%) translate(${Math.sin(frame * 0.02 + size) * 24}px, ${Math.cos(frame * 0.016 + size) * 20}px)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
};

const LensFlareSweep: React.FC<{color?: string; start?: number}> = ({color = '255,255,255', start = 0}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [start, start + 120], [-20, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: '20%',
        width: 520,
        height: 180,
        background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(${color},0.16) 50%, rgba(${color},0) 100%)`,
        transform: 'rotate(-16deg)',
        filter: 'blur(24px)',
        mixBlendMode: 'screen',
        opacity: 0.8,
      }}
    />
  );
};

const AnimatedCursor: React.FC<{
  points?: {x: number; y: number; frame: number; click?: boolean}[];
}> = ({points = [{x: 0, y: 0, frame: 0}]}) => {
  const frame = useCurrentFrame();
  const safePoints = points.length > 0 ? points : [{x: 0, y: 0, frame: 0}];
  let x = safePoints[0].x;
  let y = safePoints[0].y;

  for (let i = 0; i < safePoints.length - 1; i++) {
    const from = safePoints[i];
    const to = safePoints[i + 1];
    if (frame >= from.frame && frame <= to.frame) {
      const t = interpolate(frame, [from.frame, to.frame], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.quad),
      });
      x = interpolate(t, [0, 1], [from.x, to.x]);
      y = interpolate(t, [0, 1], [from.y, to.y]);
      break;
    }
    if (frame > to.frame) {
      x = to.x;
      y = to.y;
    }
  }

  const clickPoint = safePoints.find((p) => p.click && Math.abs(frame - p.frame) <= 4) ?? null;
  const clickDistance = clickPoint ? Math.abs(frame - clickPoint.frame) : 999;
  const cursorScale = clickPoint
    ? interpolate(clickDistance, [0, 4], [0.82, 1], {
        extrapolateRight: 'clamp',
      })
    : 1;
  const ringScale = clickPoint
    ? interpolate(clickDistance, [0, 8], [0.5, 1.35], {
        extrapolateRight: 'clamp',
      })
    : 0;
  const ringOpacity = clickPoint
    ? interpolate(clickDistance, [0, 8], [0.7, 0], {
        extrapolateRight: 'clamp',
      })
    : 0;

  const tip = arrowTipOffsetPx(28);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - tip.dx,
        top: y - tip.dy,
        width: 28,
        height: 28,
        transform: `scale(${cursorScale})`,
        zIndex: 999,
        filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.25))',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d={CURSOR_ARROW_PATH_D} fill="white" stroke="black" strokeWidth="1.5" />
      </svg>
      {ringOpacity > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: -10,
            top: -10,
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: `2px solid rgba(59,130,246,${ringOpacity})`,
            background: `rgba(59,130,246,${ringOpacity * 0.12})`,
            transform: `scale(${ringScale})`,
          }}
        />
      ) : null}
    </div>
  );
};

const WordByLetters: React.FC<{
  text?: string;
  start?: number;
  fontSize?: number;
  color?: string;
}> = ({text = 'Flyer', start = 8, fontSize = 138, color = '#ffffff'}) => {
  const frame = useCurrentFrame();
  const letters = (text ?? '').split('');
  return (
    <div style={{display: 'flex', gap: 3, justifyContent: 'center'}}>
      {letters.map((letter, i) => {
        const prog = spring({
          frame: frame - start - i * 2,
          fps: 30,
          config: {damping: 18, stiffness: 120},
          durationInFrames: 24,
        });
        const opacity = clamp01(prog);
        const y = interpolate(prog, [0, 1], [30, 0], {extrapolateRight: 'clamp'});
        const blur = interpolate(prog, [0, 1], [12, 0], {extrapolateRight: 'clamp'});
        return (
          <span
            key={i}
            style={{
              fontSize,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color,
              opacity,
              transform: `translateY(${y}px)`,
              filter: `blur(${blur}px)`,
              display: 'inline-block',
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        );
      })}
    </div>
  );
};

const Shard: React.FC<{index?: number}> = ({index = 0}) => {
  const frame = useCurrentFrame();
  const y = Math.sin(frame * 0.03 + index * 2) * 10;
  const x = Math.cos(frame * 0.024 + index) * 6;
  return (
    <div
      style={{
        width: 220 + index * 40,
        height: 128 + index * 18,
        borderRadius: 28,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 30px 70px rgba(0,0,0,0.18)',
        transform: `translate(${x}px, ${y}px) rotate(${index % 2 === 0 ? -8 : 7}deg)`,
        backdropFilter: 'blur(14px)',
      }}
    />
  );
};

const SectionTitle: React.FC<{eyebrow?: string; title?: string; subtitle?: string; dark?: boolean}> = ({eyebrow = '', title = '', subtitle = '', dark = false}) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
      {eyebrow ? (
        <div
          style={{
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            fontWeight: 600,
            color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(15,23,42,0.54)',
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 62,
          lineHeight: 1,
          fontWeight: 700,
          color: dark ? '#fff' : '#0f172a',
          letterSpacing: '-0.045em',
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 20,
          lineHeight: 1.45,
          fontWeight: 400,
          color: dark ? 'rgba(255,255,255,0.8)' : 'rgba(15,23,42,0.72)',
          maxWidth: 680,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
};

const AppChrome: React.FC<{
  preview?: boolean;
  processing?: boolean;
  calendarConnected?: boolean;
  success?: boolean;
  highlightUpload?: boolean;
}> = ({preview = false, processing = false, calendarConnected = false, success = false, highlightUpload = false}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame * 0.02) * 4;

  return (
    <div
      style={{
        width: 1140,
        minHeight: 790,
        background: '#f5f7fb',
        borderRadius: 28,
        padding: 34,
        fontFamily,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 10}}>Flyer</div>
          <div style={{fontSize: 42, fontWeight: 700, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.04em'}}>Scan Your Flyer</div>
          <div style={{fontSize: 17, fontWeight: 400, color: 'rgba(15,23,42,0.62)'}}>Extract event details instantly with AI</div>
        </div>
        <div
          style={{
            width: 56,
            height: 34,
            borderRadius: 17,
            background: '#ffffff',
            border: '1px solid rgba(15,23,42,0.08)',
            boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 7px',
            transform: `translateY(${drift}px)`,
          }}
        >
          <div style={{width: 10, height: 10, borderRadius: '50%', background: '#f59e0b'}} />
          <div style={{width: 18, height: 18, borderRadius: '50%', background: '#0f172a'}} />
        </div>
      </div>

      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          border: '1px solid rgba(15,23,42,0.08)',
          boxShadow: uiShadow,
          padding: 24,
        }}
      >
        {!preview ? (
          <div className="upload-section">
            <div
              id="uploadLabel"
              style={{
                borderRadius: 22,
                background: highlightUpload
                  ? 'linear-gradient(180deg, #ffffff 0%, #eff6ff 100%)'
                  : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                border: highlightUpload
                  ? '1px solid rgba(37,99,235,0.22)'
                  : '1px dashed rgba(15,23,42,0.16)',
                minHeight: 280,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 16,
                boxShadow: highlightUpload ? '0 0 0 4px rgba(37,99,235,0.08)' : undefined,
              }}
            >
              <div
                className="upload-icon-wrapper"
                style={{
                  width: 74,
                  height: 74,
                  borderRadius: 22,
                  background: 'linear-gradient(135deg, #dbeafe, #eef2ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 14px 30px rgba(37,99,235,0.14)',
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V8M12 8L8.5 11.5M12 8L15.5 11.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 16.5V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V16.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{fontSize: 28, fontWeight: 600, color: '#0f172a'}}>Drop your image or PDF here</div>
              <div style={{fontSize: 16, color: 'rgba(15,23,42,0.56)'}}>Supports PNG, JPG, PDF</div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, width: 420, marginTop: 4}}>
                <div style={{flex: 1, height: 1, background: 'rgba(15,23,42,0.12)'}} />
                <span style={{fontSize: 14, color: 'rgba(15,23,42,0.48)'}}>or</span>
                <div style={{flex: 1, height: 1, background: 'rgba(15,23,42,0.12)'}} />
              </div>
              <div
                id="takePhotoBtn"
                style={{
                  marginTop: 4,
                  padding: '16px 24px',
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  color: '#ffffff',
                  fontSize: 17,
                  fontWeight: 600,
                  boxShadow: '0 12px 28px -12px rgba(37,99,235,0.55)',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{width: 20, height: 20, borderRadius: 6, border: '2px solid rgba(255,255,255,0.92)'}} />
                <span>Take a Photo</span>
              </div>
            </div>
          </div>
        ) : (
          <div id="previewSection" style={{display: 'flex', flexDirection: 'column', gap: 18}}>
            <div
              className="preview-container"
              style={{
                position: 'relative',
                minHeight: 320,
                borderRadius: 22,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 35%, #fff7ed 100%)',
                boxShadow: '0 18px 40px -12px rgba(0,0,0,0.16)',
              }}
            >
              <div
                id="previewImage"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #e2e8f0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 420,
                    height: 250,
                    borderRadius: 18,
                    background: '#fff',
                    boxShadow: cardShadow,
                    padding: 24,
                    transform: 'rotate(-3deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{fontSize: 34, fontWeight: 700, color: '#1e293b'}}>Community Music Night</div>
                  <div style={{fontSize: 20, color: '#334155'}}>Friday • 7:00 PM</div>
                  <div style={{fontSize: 20, color: '#334155'}}>Riverside Hall</div>
                  <div style={{height: 1, background: 'rgba(15,23,42,0.08)', margin: '6px 0'}} />
                  <div style={{display: 'flex', gap: 10}}>
                    <div style={{padding: '8px 12px', borderRadius: 999, background: '#eff6ff', color: '#2563eb', fontWeight: 600}}>Live band</div>
                    <div style={{padding: '8px 12px', borderRadius: 999, background: '#f5f3ff', color: '#7c3aed', fontWeight: 600}}>Free entry</div>
                  </div>
                </div>
              </div>
              <div
                id="removeBtn"
                style={{
                  position: 'absolute',
                  right: 18,
                  top: 18,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(15,23,42,0.8)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  fontWeight: 600,
                }}
              >
                ×
              </div>
            </div>
            <div className="action-buttons" style={{display: 'flex', gap: 14}}>
              <div
                id="changeBtn"
                style={{
                  flex: 1,
                  padding: '16px 18px',
                  borderRadius: 14,
                  border: '1px solid rgba(15,23,42,0.1)',
                  background: 'rgba(255,255,255,0.88)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#0f172a',
                  textAlign: 'center',
                }}
              >
                Reselect File
              </div>
              <div
                id="submitBtn"
                style={{
                  flex: 1,
                  padding: '16px 18px',
                  borderRadius: 14,
                  background: processing
                    ? 'linear-gradient(135deg, #1d4ed8, #8b5cf6)'
                    : 'linear-gradient(135deg, #0f172a, #2563eb)',
                  boxShadow: '0 12px 28px -12px rgba(37,99,235,0.55)',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#ffffff',
                  textAlign: 'center',
                }}
              >
                Process Photo
              </div>
            </div>
            <div className="retake-button-container">
              <div
                id="retakePhotoBtn"
                style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: '1px solid rgba(15,23,42,0.08)',
                  background: '#f8fafc',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#334155',
                  textAlign: 'center',
                }}
              >
                Retake Photo
              </div>
            </div>
            <div
              id="statusMessage"
              style={{
                minHeight: 54,
                borderRadius: 16,
                background: processing ? 'rgba(37,99,235,0.08)' : 'rgba(15,23,42,0.04)',
                color: processing ? '#1d4ed8' : 'rgba(15,23,42,0.52)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {processing ? 'Extract event details instantly with AI' : 'Ready when you are.'}
            </div>
          </div>
        )}

        <div
          className="calendar-connection-section"
          style={{
            marginTop: 20,
            borderRadius: 20,
            border: '1px solid rgba(15,23,42,0.08)',
            background: '#ffffff',
            padding: 18,
            boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2}}>Google Calendar</div>
            <div id="calendarConnectionStatus" style={{fontSize: 14, color: calendarConnected ? '#16a34a' : 'rgba(15,23,42,0.58)', display: 'flex', alignItems: 'center', gap: 8}}>
              {calendarConnected ? <span style={{width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block'}} /> : null}
              <span>{calendarConnected ? 'Connected' : 'Not connected'}</span>
            </div>
          </div>
          <div
            id="connectCalendarBtn"
            style={{
              padding: '13px 18px',
              borderRadius: 14,
              border: '1px solid rgba(15,23,42,0.08)',
              background: calendarConnected ? 'linear-gradient(135deg, #dcfce7, #ecfdf5)' : '#ffffff',
              color: calendarConnected ? '#166534' : '#0f172a',
              fontWeight: 600,
              fontSize: 15,
              boxShadow: calendarConnected ? '0 12px 24px rgba(34,197,94,0.18)' : undefined,
            }}
          >
            Connect
          </div>
        </div>

        <div
          className="donation-section"
          style={{
            marginTop: 18,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #fff7ed, #ffffff)',
            border: '1px solid rgba(15,23,42,0.06)',
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
          }}
        >
          <div>
            <div className="donation-title" style={{fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4}}>Support Flyer</div>
            <div className="donation-text" style={{fontSize: 14, color: 'rgba(15,23,42,0.58)'}}>Help keep simple event saving available to everyone.</div>
          </div>
          <div className="btn-donate" style={{padding: '12px 18px', borderRadius: 14, background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', fontSize: 15, fontWeight: 600}}>Donate</div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid rgba(15,23,42,0.08)',
            fontSize: 13,
            color: 'rgba(15,23,42,0.52)',
          }}
        >
          <div>© 2025</div>
          <div style={{display: 'flex', gap: 16}}>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>

        {success ? (
          <div
            id="successConfirmation"
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 520,
              borderRadius: 24,
              background: '#ffffff',
              border: '1px solid rgba(16,185,129,0.18)',
              boxShadow: '0 24px 60px rgba(16,185,129,0.14)',
              padding: 28,
            }}
          >
            <div className="success-confirmation-content" style={{display: 'flex', alignItems: 'center', gap: 18}}>
              <div className="success-icon" style={{width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 40px rgba(34,197,94,0.18)'}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M6 12.5L10 16.5L18 8.5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="success-content-text" style={{flex: 1}}>
                <div className="success-title" style={{fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.03em'}}>Event added to calendar</div>
              </div>
              <div className="success-actions">
                <div id="viewEventBtn" style={{padding: '14px 18px', borderRadius: 14, background: 'linear-gradient(135deg, #0f172a, #2563eb)', color: '#fff', fontWeight: 600, fontSize: 15}}>View</div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Scene1: React.FC<{brand?: string; title?: string; subtitle?: string}> = ({brand = 'Flyer', title = 'Scan Your Flyer', subtitle = 'Extract event details instantly with AI'}) => {
  const frame = useCurrentFrame();
  const intro = interpolate(frame, [0, 18], [0, 1], {extrapolateRight: 'clamp'});
  const exit = makeExit(frame, 210);
  const taglineOpacity = interpolate(frame, [26, 54], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const subtitleOpacity = interpolate(frame, [40, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const taglineY = interpolate(frame, [26, 54], [28, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const tracking = interpolate(frame, [40, 70], [0.08, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const push = interpolate(frame, [150, 180], [1, 1.06], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={sceneStyleBase}>
      <div style={{transform: `scale(${interpolate(intro, [0, 1], [0.92, 1]) * push * exit.scale})`, opacity: intro * exit.opacity}}>
        <MeshBackground colors={['#0f172a', '#1d4ed8', '#7c3aed', '#22c55e']} base="#07111f" />
        <Particles count={20} color="255,255,255" opacity={0.18} />
        <Orb x="18%" y="24%" size={260} color="#1d4ed8" opacity={0.22} />
        <Orb x="76%" y="70%" size={320} color="#7c3aed" opacity={0.2} />
        <LensFlareSweep start={26} />
        <div style={{position: 'absolute', left: 180, top: 240, opacity: 0.7}}><Shard index={0} /></div>
        <div style={{position: 'absolute', right: 220, top: 220, opacity: 0.55}}><Shard index={1} /></div>
        <div style={{position: 'absolute', right: 360, bottom: 190, opacity: 0.45}}><Shard index={2} /></div>
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, textAlign: 'center'}}>
            <WordByLetters text={brand} start={8} fontSize={148} color="#ffffff" />
            <div style={{opacity: taglineOpacity, transform: `translateY(${taglineY}px)`, fontSize: 60, lineHeight: 1, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.04em'}}>{title}</div>
            <div style={{opacity: subtitleOpacity, fontSize: 24, fontWeight: 400, color: 'rgba(255,255,255,0.8)', letterSpacing: `${tracking}em`}}>{subtitle}</div>
          </div>
        </AbsoluteFill>
      </div>
      <Sequence from={186} durationInFrames={24} premountFor={30}>
        <LightLeak seed={4} hueShift={210} />
      </Sequence>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const exit = makeExit(local, 180);
  const flyerProg = spring({frame: local - 0, fps: 30, config: {damping: 20, stiffness: 120}, durationInFrames: 28});
  const cursorPath = [
    {x: 1300, y: 330, frame: 48},
    {x: 1300, y: 490, frame: 84, click: true},
    {x: 1300, y: 650, frame: 120, click: true},
    {x: 1280, y: 390, frame: 142},
    {x: 1300, y: 490, frame: 152, click: true},
    {x: 1300, y: 650, frame: 164, click: true},
  ];
  return (
    <AbsoluteFill style={{...sceneStyleBase, transform: `scale(${exit.scale})`, opacity: exit.opacity}}>
      <SoftGradientBackground from="#f8fafc" to="#e2e8f0" wash="#dbeafe" />
      <Particles count={8} color="15,23,42" opacity={0.08} minSize={4} maxSize={9} />
      <div style={{position: 'absolute', left: 240, top: 240, width: 300, height: 300, borderRadius: '50%', border: '1px dashed rgba(37,99,235,0.16)'}} />
      <div style={{position: 'absolute', left: 160, top: 150, width: 360, height: 220, background: 'rgba(255,255,255,0.38)', filter: 'blur(28px)', borderRadius: 40}} />
      <AbsoluteFill style={{padding: '120px 130px', display: 'flex', flexDirection: 'row', gap: 70}}>
        <div style={{width: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div
            style={{
              width: 520,
              height: 680,
              borderRadius: 28,
              background: '#ffffff',
              boxShadow: cardShadow,
              border: '1px solid rgba(15,23,42,0.08)',
              transform: `translateX(${interpolate(flyerProg, [0, 1], [-120, 0])}px) rotate(${interpolate(flyerProg, [0, 1], [-4, 0])}deg)`,
              opacity: flyerProg,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div style={{fontSize: 42, fontWeight: 700, color: '#0f172a'}}>Jazz in the Park</div>
            <div style={{fontSize: 20, color: '#475569'}}>Saturday • July 20 • 6:30 PM</div>
            <div style={{height: 260, borderRadius: 20, background: 'linear-gradient(135deg, #bfdbfe, #e9d5ff, #fef3c7)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.55)'}} />
            <div style={{fontSize: 22, color: '#334155'}}>Riverside Commons</div>
            <div style={{display: 'flex', gap: 12}}>
              <div style={{padding: '10px 14px', borderRadius: 999, background: '#eff6ff', color: '#2563eb', fontWeight: 600}}>Flyer image</div>
              <div style={{padding: '10px 14px', borderRadius: 999, background: '#f8fafc', color: '#334155', fontWeight: 600}}>Manual read</div>
            </div>
          </div>
        </div>
        <div style={{width: '55%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, position: 'relative'}}>
          {[
            {label: 'Date', value: 'Saturday, July 20'},
            {label: 'Time', value: '6:30 PM'},
            {label: 'Location', value: 'Riverside Commons'},
          ].map((item, i) => {
            const delay = 12 + i * 10;
            const p = spring({frame: local - delay, fps: 30, config: {damping: 18, stiffness: 120}, durationInFrames: 28});
            const fill = interpolate(local, [48 + i * 18, 70 + i * 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const quickFill = interpolate(local, [96 + i * 10, 112 + i * 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const compress = interpolate(local, [150, 180], [1, 0.94], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const dim = interpolate(local, [150, 180], [1, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const activeWidth = Math.max(fill, quickFill) * 100;
            return (
              <div
                key={item.label}
                style={{
                  width: 620,
                  borderRadius: 22,
                  background: '#ffffff',
                  border: '1px solid rgba(15,23,42,0.08)',
                  boxShadow: cardShadow,
                  padding: 24,
                  transform: `translateX(${interpolate(p, [0, 1], [60, 0])}px) scale(${compress})`,
                  opacity: p * dim,
                }}
              >
                <div style={{fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(15,23,42,0.5)', fontWeight: 600, marginBottom: 12}}>{item.label}</div>
                <div style={{height: 54, borderRadius: 14, border: '1px solid rgba(15,23,42,0.08)', background: 'rgba(248,250,252,0.92)', display: 'flex', alignItems: 'center', padding: '0 16px', position: 'relative', overflow: 'hidden'}}>
                  <div style={{fontSize: 20, color: '#0f172a', fontWeight: 500, opacity: activeWidth > 10 ? 1 : 0.2}}>{item.value}</div>
                  <div style={{position: 'absolute', left: 16 + activeWidth * 4.6, top: 16, width: 2, height: 22, background: '#2563eb', opacity: activeWidth < 100 ? 1 : 0}} />
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', right: 20, top: -10, width: 66, height: 66, borderRadius: 20, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: cardShadow}}>
            <div style={{width: 30, height: 30, borderRadius: 8, border: '2px solid #2563eb'}} />
          </div>
        </div>
      </AbsoluteFill>
      <AnimatedCursor points={cursorPath} />
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(255,255,255,0) ${interpolate(local, [162, 180], [0, 60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}%, rgba(219,234,254,0.55) ${interpolate(local, [162, 180], [20, 80], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}%, rgba(255,255,255,0) 100%)`, opacity: interpolate(local, [162, 180], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const enter = spring({frame: local, fps: 30, config: {damping: 18, stiffness: 110}, durationInFrames: 30});
  const browserScale = interpolate(local, [0, 24], [0.76, 0.88], {extrapolateRight: 'clamp'});
  const browserY = interpolate(local, [0, 24], [140, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const camera = interpolate(local, [80, 180], [0.88, 0.96], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const driftX = Math.sin(local * 0.015) * 16;
  const driftY = Math.cos(local * 0.018) * 12;
  const exit = makeExit(local, 210);
  return (
    <AbsoluteFill style={{...sceneStyleBase, transform: `scale(${exit.scale})`, opacity: exit.opacity}}>
      <MeshBackground colors={['#dbeafe', '#eef2ff', '#f8fafc', '#e0f2fe']} base="#f2f7ff" />
      <Particles count={14} color="37,99,235" opacity={0.08} minSize={4} maxSize={10} />
      <Orb x="14%" y="22%" size={260} color="#93c5fd" opacity={0.22} blur={60} />
      <Orb x="82%" y="74%" size={300} color="#c4b5fd" opacity={0.18} blur={60} />
      <div style={{position: 'absolute', left: '50%', bottom: 120, width: 1040, height: 70, transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(15,23,42,0.16) 0%, rgba(15,23,42,0.02) 65%, transparent 100%)', filter: 'blur(18px)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1200}}>
        <div style={{transform: `translate(${driftX}px, ${browserY + driftY}px) scale(${browserScale * camera * enter})`, opacity: enter, transformStyle: 'preserve-3d'}}>
          <FloatingBrowser url="flyer.it.com" rotateX={-8} rotateY={10} scale={0.88} width={1240}>
            <div style={{width: 1240, padding: 20, background: '#f5f7fb'}}>
              <AppChrome highlightUpload={local >= 180} />
            </div>
          </FloatingBrowser>
        </div>
      </AbsoluteFill>
      <AnimatedCursor
        points={[
          {x: 1240, y: 320, frame: 130},
          {x: 1260, y: 320, frame: 145},
          {x: 1150, y: 540, frame: 180},
          {x: 1060, y: 570, frame: 200},
        ]}
      />
      <div
        style={{
          position: 'absolute',
          left: 810,
          top: 455,
          width: 520,
          height: 312,
          borderRadius: 26,
          border: `2px solid rgba(37,99,235,${interpolate(local, [180, 210], [0, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
          boxShadow: `0 0 50px rgba(37,99,235,${interpolate(local, [180, 210], [0, 0.18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const exit = makeExit(local, 210);
  const zoom = interpolate(local, [0, 24], [1, 1.8], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  const calloutP = spring({frame: local - 18, fps: 30, config: {damping: 18, stiffness: 120}, durationInFrames: 30});
  const pulse = interpolate(local, [40, 64, 88], [1, 1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cursorPoints = [
    {x: 1360, y: 760, frame: 90},
    {x: 1160, y: 650, frame: 132},
    {x: 1160, y: 650, frame: 134, click: true},
  ];
  const ripple = interpolate(local, [134, 180], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{...sceneStyleBase, transform: `scale(${exit.scale})`, opacity: exit.opacity}}>
      <SoftGradientBackground from="#eff6ff" to="#f8fafc" wash="#dbeafe" />
      <Particles count={10} color="37,99,235" opacity={0.08} minSize={4} maxSize={9} />
      <AbsoluteFill style={{filter: 'blur(30px)', opacity: 0.45}}>
        <div style={{position: 'absolute', left: 480, top: 160, transform: `scale(${zoom * 0.68}) translateY(40px)`}}>
          <BrowserFrame url="flyer.it.com" width={1180}>
            <div style={{padding: 30, background: '#f5f7fb'}}><AppChrome /></div>
          </BrowserFrame>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${zoom}) translateY(30px)`}}>
          <div
            style={{
              width: 860,
              minHeight: 420,
              borderRadius: 22,
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px dashed rgba(15,23,42,0.16)',
              boxShadow: cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 18,
              position: 'relative',
            }}
          >
            <div style={{position: 'absolute', inset: -8, borderRadius: 30, border: `2px solid rgba(59,130,246,${interpolate(local, [40, 88], [0.08, 0.24], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`, boxShadow: `0 0 40px rgba(59,130,246,${interpolate(local, [40, 88], [0.08, 0.22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}} />
            <div style={{position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '2px solid rgba(37,99,235,0.18)', transform: `scale(${1 + Math.sin(local * 0.08) * 0.05})`, top: 78}} />
            <div style={{width: 88, height: 88, borderRadius: 24, background: 'linear-gradient(135deg, #dbeafe, #eef2ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pulse})`, boxShadow: '0 14px 30px rgba(37,99,235,0.14)'}}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V8M12 8L8.5 11.5M12 8L15.5 11.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 16.5V17C5 18.1046 5.89543 19 7 19H17C18.1046 19 19 18.1046 19 17V16.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{fontSize: 38, fontWeight: 600, color: '#0f172a'}}>Drop your image or PDF here</div>
            <div style={{fontSize: 20, color: 'rgba(15,23,42,0.56)'}}>Supports PNG, JPG, PDF</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, width: 460}}>
              <div style={{flex: 1, height: 1, background: 'rgba(15,23,42,0.12)'}} />
              <span style={{fontSize: 16, color: 'rgba(15,23,42,0.48)'}}>or</span>
              <div style={{flex: 1, height: 1, background: 'rgba(15,23,42,0.12)'}} />
            </div>
            <div style={{padding: '18px 28px', borderRadius: 14, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#ffffff', fontWeight: 600, fontSize: 20, boxShadow: '0 12px 28px -12px rgba(37,99,235,0.55)', position: 'relative'}}>
              Take a Photo
              <div style={{position: 'absolute', left: '50%', top: '50%', width: 100, height: 100, borderRadius: '50%', border: `2px solid rgba(59,130,246,${1 - ripple})`, transform: `translate(-50%, -50%) scale(${1 + ripple * 1.8})`, opacity: ripple}} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 160,
          top: 170,
          width: 460,
          padding: 26,
          borderRadius: 24,
          ...glassStyle,
          color: '#ffffff',
          transform: `translateX(${interpolate(calloutP, [0, 1], [-80, 0])}px)`,
          opacity: calloutP,
        }}
      >
        <div style={{fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.7)', marginBottom: 10}}>Primary action</div>
        <div style={{fontSize: 34, lineHeight: 1.1, fontWeight: 600}}>Upload an image or PDF — or capture instantly.</div>
      </div>
      <AnimatedCursor points={cursorPoints} />
    </AbsoluteFill>
  );
};

const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const exit = makeExit(local, 210);
  const previewP = spring({frame: local, fps: 30, config: {damping: 18, stiffness: 120}, durationInFrames: 30});
  const removeP = spring({frame: local - 18, fps: 30, config: {damping: 16, stiffness: 120}, durationInFrames: 24});
  const btn1 = spring({frame: local - 40, fps: 30, config: {damping: 18, stiffness: 120}, durationInFrames: 26});
  const btn2 = spring({frame: local - 48, fps: 30, config: {damping: 18, stiffness: 120}, durationInFrames: 26});
  const retake = interpolate(local, [80, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = interpolate(local, [180, 210], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{...sceneStyleBase, transform: `scale(${exit.scale})`, opacity: exit.opacity}}>
      <SoftGradientBackground from="#eff6ff" to="#f8fafc" wash="#dbeafe" />
      <Particles count={12} color="37,99,235" opacity={0.08} minSize={4} maxSize={10} />
      <div style={{position: 'absolute', left: 200, top: 160, width: 240, height: 160, borderRadius: 22, background: 'rgba(255,255,255,0.45)', filter: 'blur(20px)'}} />
      <div style={{position: 'absolute', right: 220, top: 170, width: 180, height: 130, borderRadius: 22, background: 'rgba(191,219,254,0.35)', filter: 'blur(18px)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1200}}>
        <div style={{transform: `scale(${0.9 + previewP * 0.06}) translateY(${interpolate(previewP, [0, 1], [50, 0])}px)`}}>
          <FloatingBrowser url="flyer.it.com" rotateX={-8} rotateY={11} scale={0.9} width={1240}>
            <div style={{width: 1240, padding: 20, background: '#f5f7fb', position: 'relative'}}>
              <AppChrome preview />
              <div style={{position: 'absolute', right: 325, top: 184, transform: `scale(${removeP})`, opacity: removeP}} />
              <div style={{position: 'absolute', left: 420, bottom: 208, transform: `translateY(${interpolate(btn1, [0, 1], [40, 0])}px)`, opacity: btn1}} />
              <div style={{position: 'absolute', left: 720, bottom: 208, transform: `translateY(${interpolate(btn2, [0, 1], [40, 0])}px)`, opacity: btn2}} />
              <div style={{position: 'absolute', left: 560, bottom: 128, opacity: retake, transform: `translateY(${interpolate(retake, [0, 1], [18, 0])}px)`}} />
              <div style={{position: 'absolute', left: 688, bottom: 190, width: 230, height: 58, borderRadius: 16, boxShadow: `0 0 40px rgba(37,99,235,${glow * 0.24})`, border: `2px solid rgba(59,130,246,${glow * 0.35})`}} />
            </div>
          </FloatingBrowser>
        </div>
      </AbsoluteFill>
      <AnimatedCursor
        points={[
          {x: 1250, y: 292, frame: 120},
          {x: 950, y: 760, frame: 142},
          {x: 760, y: 852, frame: 160},
          {x: 1140, y: 760, frame: 188},
        ]}
      />
    </AbsoluteFill>
  );
};

const Scene6: React.FC<{subtitle?: string}> = ({subtitle = 'Extract event details instantly with AI'}) => {
  const frame = useCurrentFrame();
  const local = frame;
  const exit = makeExit(local, 210);
  const press = interpolate(local, [0, 18, 50], [1, 0.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const status = interpolate(local, [30, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const calm = interpolate(local, [190, 210], [1, 0.96], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{...sceneStyleBase, background: '#09111f', transform: `scale(${exit.scale * calm})`, opacity: exit.opacity}}>
      <MeshBackground colors={['#2563eb', '#38bdf8', '#8b5cf6', '#0f172a']} base="#08101d" />
      <Particles count={16} color="147,197,253" opacity={0.18} minSize={3} maxSize={8} />
      <Orb x="20%" y="30%" size={280} color="#2563eb" opacity={0.18} blur={70} />
      <Orb x="76%" y="30%" size={250} color="#8b5cf6" opacity={0.18} blur={70} />
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.12}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: interpolate(local, [60, 150], [220, 760], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), height: 2, background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.8), transparent)', boxShadow: '0 0 24px rgba(56,189,248,0.4)'}} />
      <AbsoluteFill style={{padding: '120px 120px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{width: 820, position: 'relative'}}>
          <div style={{fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.64)', marginBottom: 18}}>AI extraction</div>
          <div style={{transform: `scale(${press})`, transformOrigin: 'left center', width: 340, padding: '18px 26px', borderRadius: 18, background: 'linear-gradient(135deg, #1d4ed8, #8b5cf6)', color: '#fff', fontWeight: 600, fontSize: 28, boxShadow: '0 18px 40px rgba(37,99,235,0.3)'}}>Process Photo</div>
          <div style={{marginTop: 26, width: 520, minHeight: 64, borderRadius: 18, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 20px', opacity: status, color: '#dbeafe', fontWeight: 500, fontSize: 18}}>
            {subtitle}
            <span style={{marginLeft: 10, letterSpacing: '0.1em'}}>{status > 0.1 ? '...' : ''}</span>
          </div>
          <div style={{marginTop: 56, width: 560, height: 360, borderRadius: 30, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.18)'}}>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 40%, #fff7ed 100%)', opacity: 0.8}} />
            <div style={{position: 'absolute', left: 110, top: 72, width: 340, height: 210, borderRadius: 20, background: '#ffffff', boxShadow: cardShadow, transform: 'rotate(-4deg)'}} />
          </div>
        </div>
        <div style={{width: 700, display: 'flex', flexDirection: 'column', gap: 18, position: 'relative'}}>
          {[
            {label: 'Event title', value: 'Community Music Night', start: 60},
            {label: 'Date', value: 'Friday, July 12', start: 78},
            {label: 'Time', value: '7:00 PM', start: 96},
            {label: 'Location', value: 'Riverside Hall', start: 114},
          ].map((item, i) => {
            const p = spring({frame: local - item.start, fps: 30, config: {damping: 18, stiffness: 120}, durationInFrames: 30});
            const chars = Math.floor(interpolate(local, [item.start + 6, item.start + 30], [0, (item.value ?? '').length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
            const showText = (item.value ?? '').slice(0, chars);
            return (
              <div
                key={item.label}
                style={{
                  width: 520,
                  borderRadius: 22,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 18px 40px -12px rgba(0,0,0,0.22)',
                  padding: 22,
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [28, 0])}px)`,
                  marginLeft: i % 2 === 0 ? 0 : 60,
                }}
              >
                <div style={{fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.56)', marginBottom: 10}}>{item.label}</div>
                <div style={{fontSize: 28, fontWeight: 600, color: '#ffffff', minHeight: 34}}>{showText}</div>
              </div>
            );
          })}
          {[0, 1, 2].map((i) => {
            const lineP = interpolate(local, [120 + i * 8, 190], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: -220,
                  top: 106 + i * 118,
                  width: 260,
                  height: 2,
                  background: `linear-gradient(90deg, rgba(56,189,248,${lineP}), rgba(139,92,246,${lineP * 0.9}))`,
                  transform: `scaleX(${lineP})`,
                  transformOrigin: 'left center',
                  boxShadow: '0 0 18px rgba(56,189,248,0.35)',
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
      <AnimatedCursor points={[{x: 416, y: 280, frame: 0}, {x: 416, y: 280, frame: 18, click: true}]} />
    </AbsoluteFill>
  );
};

const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const exit = makeExit(local, 210);
  const focus = spring({frame: local, fps: 30, config: {damping: 18, stiffness: 120}, durationInFrames: 28});
  const leftText = interpolate(local, [18, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const button = interpolate(local, [40, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const connected = interpolate(local, [122, 180], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{...sceneStyleBase, transform: `scale(${exit.scale})`, opacity: exit.opacity}}>
      <MeshBackground colors={['#ecfeff', '#eff6ff', '#f5f3ff', '#dbeafe']} base="#f8fbff" />
      <Particles count={8} color="37,99,235" opacity={0.08} minSize={4} maxSize={9} />
      <div style={{position: 'absolute', left: 1230, top: 520, width: 150, height: 150, borderRadius: '50%', border: '2px solid rgba(37,99,235,0.14)', transform: `scale(${1 + Math.sin(local * 0.08) * 0.06})`}} />
      <div style={{position: 'absolute', left: 1080, top: 350, width: 420, height: 420, borderRadius: '50%', border: '1px solid rgba(124,58,237,0.08)'}} />
      <div style={{position: 'absolute', left: 150, top: 130, width: 460, padding: 24, borderRadius: 24, ...glassStyle, color: '#0f172a', background: 'rgba(255,255,255,0.46)'}}>
        <div style={{fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(15,23,42,0.54)', marginBottom: 10}}>Calendar handoff</div>
        <div style={{fontSize: 32, lineHeight: 1.15, fontWeight: 600}}>Move from flyer to schedule in one flow.</div>
      </div>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: `scale(${0.92 + focus * 0.08}) translateY(${interpolate(focus, [0, 1], [50, 0])}px)`}}>
          <div style={{width: 980, borderRadius: 28, background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', boxShadow: uiShadow, padding: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30}}>
            <div style={{opacity: leftText, transform: `translateX(${interpolate(leftText, [0, 1], [-30, 0])}px)`}}>
              <div style={{fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2}}>Google Calendar</div>
              <div style={{fontSize: 16, color: connected > 0.2 ? '#16a34a' : 'rgba(15,23,42,0.58)', display: 'flex', alignItems: 'center', gap: 8}}>
                {connected > 0.2 ? <span style={{width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block'}} /> : null}
                <span>{connected > 0.65 ? 'Connected' : 'Not connected'}</span>
              </div>
            </div>
            <div style={{transform: `translateX(${interpolate(button, [0, 1], [50, 0])}px)`, opacity: button}}>
              <div style={{padding: '16px 24px', borderRadius: 14, background: connected > 0.4 ? 'linear-gradient(135deg, #dcfce7, #ecfdf5)' : '#ffffff', border: '1px solid rgba(15,23,42,0.08)', boxShadow: connected > 0.4 ? '0 12px 24px rgba(34,197,94,0.18)' : undefined, fontSize: 18, fontWeight: 600, color: connected > 0.4 ? '#166534' : '#0f172a'}}>Connect</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 466, top: 468, width: 980, height: 146, borderRadius: 32, boxShadow: `0 0 60px rgba(34,197,94,${connected * 0.18})`, border: `2px solid rgba(34,197,94,${connected * 0.28})`}} />
      <AnimatedCursor points={[{x: 980, y: 790, frame: 80}, {x: 1320, y: 540, frame: 120}, {x: 1320, y: 540, frame: 122, click: true}]} />
    </AbsoluteFill>
  );
};

const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const exit = makeExit(local, 210);
  const settle = spring({frame: local, fps: 30, config: {damping: 18, stiffness: 110}, durationInFrames: 30});
  const cardP = spring({frame: local - 20, fps: 30, config: {damping: 12, stiffness: 120}, durationInFrames: 32});
  const draw = interpolate(local, [48, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const titleChars = Math.floor(interpolate(local, [65, 100], [0, 'Event added to calendar'.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const tiltBack = interpolate(local, [160, 210], [0, -4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = interpolate(local, [160, 210], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{...sceneStyleBase, transform: `scale(${exit.scale})`, opacity: exit.opacity}}>
      <MeshBackground colors={['#eff6ff', '#ffffff', '#dcfce7', '#dbeafe']} base="#f8fbff" />
      <Particles count={12} color="34,197,94" opacity={0.12} minSize={3} maxSize={8} />
      <div style={{position: 'absolute', left: 720, top: 330, width: 440, height: 440, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', filter: 'blur(60px)'}} />
      <LensFlareSweep color="255,255,255" start={90} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1200}}>
        <div style={{transform: `scale(${0.9 + settle * 0.06}) rotateX(${tiltBack}deg)`}}>
          <FloatingBrowser url="flyer.it.com" rotateX={-7} rotateY={8} scale={0.9} width={1240}>
            <div style={{width: 1240, padding: 20, background: '#f5f7fb', position: 'relative'}}>
              <AppChrome preview success calendarConnected />
              <div style={{position: 'absolute', left: 350, top: 230, width: 540, height: 180, borderRadius: 28, background: `rgba(255,255,255,${0.72 - settle * 0.3})`}} />
            </div>
          </FloatingBrowser>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 698, top: 402, width: 524, height: 156, borderRadius: 28, boxShadow: `0 0 70px rgba(34,197,94,${glow * 0.26})`, border: `2px solid rgba(34,197,94,${glow * 0.3})`}} />
      <div style={{position: 'absolute', left: 765, top: 445, width: 28, height: 20, overflow: 'hidden'}}>
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <path d={`M2 10 L${2 + 10 * draw} ${10 + 6 * draw} L${2 + 24 * draw} ${2 + 8 * draw}`} stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: 808, top: 442, fontSize: 28, fontWeight: 700, color: '#0f172a'}}>{('Event added to calendar').slice(0, titleChars)}</div>
      <AnimatedCursor points={[{x: 1260, y: 610, frame: 120}, {x: 1170, y: 487, frame: 160}, {x: 1170, y: 487, frame: 160, click: true}]} />
    </AbsoluteFill>
  );
};

const MiniThemeToggle: React.FC = () => {
  const frame = useCurrentFrame();
  const knobX = interpolate(frame, [80, 110], [10, 34], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{width: 66, height: 38, borderRadius: 19, background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)', position: 'relative'}}>
      <div style={{position: 'absolute', left: knobX, top: 7, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #0f172a, #2563eb)', boxShadow: '0 6px 16px rgba(37,99,235,0.24)'}} />
    </div>
  );
};

const MiniStatus: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.7, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{padding: '14px 16px', borderRadius: 14, background: `rgba(37,99,235,${0.08 * pulse + 0.04})`, color: '#1d4ed8', fontWeight: 500}}>Extract event details instantly with AI</div>;
};

const MiniActions: React.FC = () => {
  const frame = useCurrentFrame();
  const glow = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.12, 0.28]);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
      <div style={{display: 'flex', gap: 10}}>
        <div style={{flex: 1, padding: '12px 14px', borderRadius: 14, background: '#ffffff', border: '1px solid rgba(15,23,42,0.08)', fontWeight: 600, fontSize: 14, textAlign: 'center'}}>Connect</div>
        <div style={{flex: 1, padding: '12px 14px', borderRadius: 14, background: 'linear-gradient(135deg, #0f172a, #2563eb)', color: '#fff', boxShadow: `0 12px 28px -12px rgba(37,99,235,${glow})`, fontWeight: 600, fontSize: 14, textAlign: 'center'}}>Process Photo</div>
      </div>
      <div style={{display: 'flex', gap: 10}}>
        <div style={{flex: 1, padding: '12px 14px', borderRadius: 14, background: '#f8fafc', border: '1px solid rgba(15,23,42,0.08)', fontWeight: 600, fontSize: 14, textAlign: 'center'}}>Retake Photo</div>
        <div style={{flex: 1, padding: '12px 14px', borderRadius: 14, background: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: 14, textAlign: 'center'}}>View</div>
      </div>
    </div>
  );
};

const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const exit = makeExit(local, 210);
  const caption = interpolate(local, [0, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lateral = interpolate(local, [160, 210], [0, -40], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cards = [
    {title: 'Theme Toggle', x: 280, body: <MiniThemeToggle />},
    {title: 'Status Messaging', x: 760, body: <MiniStatus />},
    {title: 'Focused Actions', x: 1240, body: <MiniActions />},
  ];
  return (
    <AbsoluteFill style={{...sceneStyleBase, transform: `scale(${exit.scale}) translateX(${lateral}px)`, opacity: exit.opacity}}>
      <MeshBackground colors={['#ffffff', '#eef2ff', '#f5f3ff', '#ffffff']} base="#ffffff" />
      <Particles count={9} color="124,58,237" opacity={0.08} minSize={4} maxSize={9} />
      <LensFlareSweep color="255,255,255" start={90} />
      <div style={{position: 'absolute', left: 860, top: 320, width: 240, height: 240, borderRadius: '50%', border: '2px dashed rgba(124,58,237,0.12)', transform: `rotate(${local * 0.8}deg)`}} />
      <AbsoluteFill style={{paddingTop: 120, alignItems: 'center'}}>
        <div style={{opacity: caption, transform: `translateY(${interpolate(caption, [0, 1], [-24, 0])}px)`, fontSize: 22, fontWeight: 500, color: 'rgba(15,23,42,0.68)', marginBottom: 54}}>Built to keep you moving.</div>
        <div style={{display: 'flex', gap: 34}}>
          {cards.map((card, i) => {
            const p = spring({frame: local - (20 + i * 12), fps: 30, config: {damping: 18, stiffness: 120}, durationInFrames: 34});
            const hover = Math.sin(local * 0.03 + i) * 8;
            return (
              <div
                key={card.title}
                style={{
                  width: 410,
                  minHeight: 330,
                  borderRadius: 24,
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                  boxShadow: cardShadow,
                  border: '1px solid rgba(15,23,42,0.08)',
                  padding: 28,
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [60, 0]) + hover}px) rotate(${interpolate(p, [0, 1], [3, 0])}deg)`,
                }}
              >
                <div style={{fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(15,23,42,0.46)', marginBottom: 14}}>Interface detail</div>
                <div style={{fontSize: 34, lineHeight: 1.05, fontWeight: 700, color: '#0f172a', marginBottom: 22, letterSpacing: '-0.035em'}}>{card.title}</div>
                {card.body}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Scene10: React.FC<{brand?: string; url?: string}> = ({brand = 'Flyer', url = 'flyer.it.com'}) => {
  const frame = useCurrentFrame();
  const local = frame;
  const bg = interpolate(local, [0, 30], [0.92, 1], {extrapolateRight: 'clamp'});
  const logo = interpolate(local, [20, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tagline = interpolate(local, [60, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const urlP = interpolate(local, [90, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ctaP = interpolate(local, [130, 190], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const finalFade = interpolate(local, [230, 240], [1, 0.92], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shimmerX = interpolate(local, [20, 90], [-220, 260], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{...sceneStyleBase, opacity: finalFade}}>
      <div style={{transform: `scale(${bg})`}}>
        <MeshBackground colors={['#111827', '#2563eb', '#7c3aed', '#06b6d4']} base="#0a1020" />
      </div>
      <Particles count={18} color="255,255,255" opacity={0.16} minSize={3} maxSize={9} />
      <Orb x="16%" y="24%" size={320} color="#2563eb" opacity={0.2} blur={70} />
      <Orb x="82%" y="28%" size={300} color="#7c3aed" opacity={0.18} blur={70} />
      <Orb x="70%" y="80%" size={280} color="#06b6d4" opacity={0.16} blur={70} />
      <div style={{position: 'absolute', left: -120, top: -60, width: 480, height: 260, background: 'linear-gradient(135deg, rgba(255,255,255,0.12), transparent)', filter: 'blur(24px)', transform: 'rotate(-12deg)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center'}}>
          <div style={{position: 'relative', opacity: logo, transform: `translateY(${interpolate(logo, [0, 1], [30, 0])}px)`}}>
            <div style={{fontSize: 152, fontWeight: 700, letterSpacing: '-0.05em', color: '#ffffff'}}>{brand}</div>
            <div style={{position: 'absolute', top: 0, left: shimmerX, width: 180, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', filter: 'blur(8px)', transform: 'skewX(-20deg)'}} />
          </div>
          <div style={{opacity: tagline, transform: `translateY(${interpolate(tagline, [0, 1], [18, 0])}px)`, fontSize: 38, fontWeight: 500, color: 'rgba(255,255,255,0.86)'}}>Scan it. Process it. Save it.</div>
          <div style={{opacity: urlP, transform: `scale(${interpolate(urlP, [0, 1], [0.94, 1])})`, position: 'relative', marginTop: 12}}>
            <div style={{fontSize: 48, fontWeight: 600, color: '#ffffff'}}>{url}</div>
            <div style={{marginTop: 10, width: 260, height: 3, borderRadius: 999, background: 'linear-gradient(90deg, rgba(96,165,250,0.3), rgba(255,255,255,0.8), rgba(167,139,250,0.3))', boxShadow: '0 0 18px rgba(255,255,255,0.25)'}} />
          </div>
          <div style={{opacity: ctaP, transform: `translateY(${interpolate(ctaP, [0, 1], [20, 0])}px)`, marginTop: 10}}>
            <div style={{padding: '16px 28px', borderRadius: 999, background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.08))', border: '1px solid rgba(255,255,255,0.18)', color: '#ffffff', fontWeight: 600, fontSize: 18, boxShadow: '0 12px 28px -12px rgba(255,255,255,0.2)'}}>Try Flyer</div>
          </div>
          <div style={{position: 'absolute', bottom: -150, fontSize: 15, color: 'rgba(255,255,255,0.56)', display: 'flex', gap: 14}}>
            <span>Privacy</span>
            <span>•</span>
            <span>Terms</span>
            <span>•</span>
            <span>© 2025</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const FlyerPromo: React.FC<FlyerPromoProps> = ({brand = 'Flyer', title = 'Scan Your Flyer', subtitle = 'Extract event details instantly with AI', url = 'flyer.it.com'}) => {
  return (
    <AbsoluteFill style={{fontFamily}}>
      <Sequence from={0} durationInFrames={210} premountFor={30}>
        <Scene1 brand={brand} title={title} subtitle={subtitle} />
      </Sequence>
      <Sequence from={210} durationInFrames={180} premountFor={30}>
        <Scene2 />
      </Sequence>
      <Sequence from={390} durationInFrames={210} premountFor={30}>
        <Scene3 />
      </Sequence>
      <Sequence from={600} durationInFrames={210} premountFor={30}>
        <Scene4 />
      </Sequence>
      <Sequence from={810} durationInFrames={210} premountFor={30}>
        <Scene5 />
      </Sequence>
      <Sequence from={1020} durationInFrames={210} premountFor={30}>
        <Scene6 subtitle={subtitle} />
      </Sequence>
      <Sequence from={1230} durationInFrames={210} premountFor={30}>
        <Scene7 />
      </Sequence>
      <Sequence from={1440} durationInFrames={210} premountFor={30}>
        <Scene8 />
      </Sequence>
      <Sequence from={1650} durationInFrames={210} premountFor={30}>
        <Scene9 />
      </Sequence>
      <Sequence from={1860} durationInFrames={240} premountFor={30}>
        <Scene10 brand={brand} url={url} />
      </Sequence>
      <Sequence from={186} durationInFrames={24} premountFor={30}>
        <LightLeak seed={6} hueShift={35} />
      </Sequence>
      <Sequence from={1836} durationInFrames={24} premountFor={30}>
        <LightLeak seed={3} hueShift={18} />
      </Sequence>
    </AbsoluteFill>
  );
};
