// Hack Indy 2026 - Shared constants

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Site palette (derived from captured HTML inline styles)
export const COLORS = {
  bgPrimary: "#0a0a0d",
  bgSecondary: "#111116",
  racingGold: "#d4a853",
  borderGold: "#d4a85366",
  textPrimary: "#f0f0f0",
  textSecondary: "#a0a0a8",
  textMuted: "#606068",
  greenLive: "rgb(34, 197, 94)",
  greenLiveAlpha: "rgba(34, 197, 94, 0.35)",
  greenLiveFaint: "rgba(34, 197, 94, 0.06)",
  goldBgFaint: "rgba(212, 168, 83, 0.05)",
  goldBg10: "rgba(212, 168, 83, 0.1)",
} as const;

// Scene durations in frames
export const SCENES = {
  scene1: { start: 0, duration: 180 },
  scene2: { start: 180, duration: 210 },
  scene3: { start: 390, duration: 300 },
  scene4: { start: 690, duration: 330 },
  scene5: { start: 1020, duration: 330 },
  scene6: { start: 1350, duration: 300 },
  scene7: { start: 1650, duration: 300 },
  scene8: { start: 1950, duration: 300 },
} as const;

// Transition overlaps in frames
export const TRANSITION_FRAMES = 30;

// Total duration accounting for 7 transitions
// Sum of all scene durations = 180+210+300+330+330+300+300+300 = 2250
// With 7 transitions of 30f each: 2250 - (7*30) = 2040
// But we need exactly 2250 frames.
// So we set scene durations to account for overlaps.
// Actual scene durations for TransitionSeries:
export const TS_SCENES = [
  { id: "scene1", duration: 210 },
  { id: "scene2", duration: 240 },
  { id: "scene3", duration: 330 },
  { id: "scene4", duration: 360 },
  { id: "scene5", duration: 360 },
  { id: "scene6", duration: 330 },
  { id: "scene7", duration: 330 },
  { id: "scene8", duration: 300 },
] as const;

// Total duration: sum of all durations - 7 transitions * 30f
// = 2460 - 210 = 2250
export const TOTAL_DURATION_IN_FRAMES =
  TS_SCENES.reduce((s, c) => s + c.duration, 0) -
  (TS_SCENES.length - 1) * TRANSITION_FRAMES;
// = 2460 - 210 = 2250
