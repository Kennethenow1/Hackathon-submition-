import type { WebsiteComponentFile } from "./website-artifact";

/** Persisted markdown outputs from the generating agent (and user edits). */
export type GenerationDraft = {
  websiteBundleId: string;
  updatedAt: string;
  ideasMd?: string;
  voiceMd: string;
  soundMd: string;
  promptMd: string;
};

export type VideoStyle = "default" | "fast-paced";

export type GeneratingAgentRequestBody = {
  websiteComponent: WebsiteComponentFile;
  vision?: string;
  /** Target length, pacing, format (e.g. "45s", "90 second walkthrough") — passed to the generating agent as video_spec. */
  videoSpec?: string;
  selectedEffectIds?: string[];
  effectsCatalog?: { id: string; label: string; description?: string }[];
  /** Video pacing style. "fast-paced" = constant motion, rapid cuts, every second has action. */
  videoStyle?: VideoStyle;
};

export type GeneratingAgentSuccess = {
  ok: true;
  ideasMd?: string;
  voiceMd: string;
  soundMd: string;
  promptMd: string;
  /** Primary model (OpenAI: visual/ideas+prompt phase; Anthropic: single pass). */
  model: string;
  /** OpenAI only: model used for voice_md + sound_md JSON pass. */
  voiceSoundModel?: string;
};

export type GeneratingAgentFailure = {
  ok: false;
  error: string;
  code?: string;
  hint?: string;
};

export type GeneratingAgentResponse = GeneratingAgentSuccess | GeneratingAgentFailure;
