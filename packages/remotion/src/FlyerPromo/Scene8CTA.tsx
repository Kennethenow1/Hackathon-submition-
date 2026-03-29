import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import { GradientMeshBg } from './GradientMeshBg';
import { Particles } from './Particles';
import { OrbitRing } from './OrbitRing';
import { COLORS } from './colors';

const { loadFont } = require('@remotion/google-fonts/Outfit');
loadFont();

const TAGLINE_WORDS = ['From', 'flyer', 'to', 'calendar,', 'fast.'];

export const Scene8CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Relative frames (scene starts at absolute 840)

  // BG intensify (frames 0-18 relative)
  const bgIntensity = interpolate(frame, [0, 18], [0.6, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo spring pop (frames 6-30 relative)
  const logoS = spring({ frame: frame - 6, fps, config: { damping: 12, stiffness: 130 } });
  const logoScale = interpolate(logoS, [0, 1], [0.7, 1.0]);
  const logoO = interpolate(logoS, [0, 1], [0, 1]);
  const logoGlow = interpolate(Math.sin(frame * 0.08), [-1, 1], [0.3, 0.6]);

  // Tagline words (frames 18-42 relative)
  const taglineWords = TAGLINE_WORDS.map((_, i) => {
    const delay = 18 + i * 5;
    const s = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 120 } });
    return {
      opacity: interpolate(s, [0, 1], [0, 1]),
      y: interpolate(s, [0, 1], [24, 0]),
    };
  });

  // Shimmer on "calendar" word (index 3)
  const shimmerX = interpolate(frame, [30, 50], [-60, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // URL fade in (frames 30-54 relative)
  const urlS = spring({ frame: frame - 30, fps, config: { damping: 16, stiffness: 100 } });
  const urlO = interpolate(urlS, [0, 1], [0, 1]);
  const urlY = interpolate(urlS, [0, 1], [16, 0]);

  // URL underline glow
  const urlGlow = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.2, 0.55]);

  // End fade (frames 48-60 relative)
  const endFade = interpolate(frame, [48, 60], [1, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Slow parallax drift
  const drift = Math.sin(frame * 0.015) * 5;

  // Ghosted browser silhouette
  const ghostO = interpolate(frame, [12, 30], [0, 0.08], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Lens flare
  const flareO = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.1, 0.25]);
  const flareX = 75 + Math.sin(frame * 0.012) * 10;

  return (
    <AbsoluteFill
      style={{
        fontFamily: 'Outfit, sans-serif',
        opacity: endFade,
        overflow: 'hidden',
      }}
    >
      {/* Richest gradient mesh */}
      <div style={{ opacity: bgIntensity, position: 'absolute', inset: 0 }}>
        <GradientMeshBg
          colors={[
            COLORS.accent + 'aa',
            COLORS.accentLight + '88',
            COLORS.accentSoft,
            COLORS.success + '33',
          ]}
        />
      </div>

      {/* Lens flare */}
      <div
        style={{
          position: 'absolute',
          left: `${flareX}%`,
          top: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,${flareO}) 0%, transparent 60%)`,
          filter: 'blur(30px)',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <Particles count={10} color="rgba(99,102,241,0.3)" />
      </AbsoluteFill>

      <OrbitRing size={360} speed={0.18} dashArray="10 18" color="rgba(99,102,241,0.09)" cx="50%" cy="50%" />

      {/* Ghosted browser silhouette */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${drift * 0.5}px)`,
          width: 700,
          height: 480,
          borderRadius: 16,
          border: `2px solid rgba(99,102,241,${ghostO * 10})`,
          background: `rgba(99,102,241,${ghostO * 2})`,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          transform: `translateY(${drift}px)`,
        }}
      >
        {/* Flyer logo */}
        <div
          style={{
            opacity: logoO,
            transform: `scale(${logoScale})`,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: COLORS.textPrimary,
              letterSpacing: -3,
              lineHeight: 0.95,
              textShadow: `0 0 60px rgba(99,102,241,${logoGlow})`,
            }}
          >
            Flyer
          </div>
        </div>

        {/* Tagline word-by-word */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {TAGLINE_WORDS.map((word, i) => (
            <span
              key={i}
              style={{
                fontSize: 36,
                fontWeight: 500,
                color: COLORS.textSecondary,
                opacity: taglineWords[i].opacity,
                transform: `translateY(${taglineWords[i].y}px)`,
                display: 'inline-block',
                position: 'relative',
              }}
            >
              {i === 3 ? (
                <span style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(90deg, transparent, ${COLORS.accentLight}88, transparent)`,
                      backgroundSize: '200% 100%',
                      backgroundPositionX: shimmerX,
                      WebkitBackgroundClip: 'text',
                      pointerEvents: 'none',
                    }}
                  />
                  <span style={{ fontWeight: 700, color: COLORS.accent }}>
                    {word}
                  </span>
                </span>
              ) : (
                word
              )}
            </span>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            opacity: urlO,
            transform: `translateY(${urlY}px)`,
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: COLORS.accent,
              letterSpacing: 0.5,
            }}
          >
            flyer.it.com
          </div>
          {/* Underline glow */}
          <div
            style={{
              position: 'absolute',
              bottom: -3,
              left: 0,
              right: 0,
              height: 2,
              background: COLORS.accent,
              opacity: urlGlow,
              boxShadow: `0 0 8px rgba(99,102,241,${urlGlow})`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
