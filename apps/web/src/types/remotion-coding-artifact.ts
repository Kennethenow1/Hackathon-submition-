export type RemotionCodingFile = {
  path: string;
  content: string;
};

export type RemotionCodingRequestBody = {
  promptMd: string;
  voiceMd?: string;
  soundMd?: string;
  /** If false, omit embedded `<Video>` / external video clips; graphics and stills only. Default true. */
  includeVideo?: boolean;
  /** If false, omit `<Audio>` / voiceover / SFX in code; silent render. Default true. */
  includeAudio?: boolean;
};

export type RemotionCodingSuccess = {
  ok: true;
  model: string;
  /** Which API served the completion (`openai` | `anthropic`). */
  provider?: "openai" | "anthropic";
  /** Primary `<Composition id=…>` to pass to `remotion render`. */
  compositionId: string;
  summary: string;
  files: RemotionCodingFile[];
  notes: string;
  renderSuggestion: string;
};

export type RemotionCodingFailure = {
  ok: false;
  error: string;
  code?: string;
  hint?: string;
  raw?: unknown;
};

export type RemotionCodingResponse = RemotionCodingSuccess | RemotionCodingFailure;

export type RemotionRenderPreviewSuccess = {
  ok: true;
  videoUrl: string;
  compositionId: string;
  audioWarnings?: string[];
};

export type RemotionRenderPreviewFailure = {
  ok: false;
  error: string;
  code?: string;
  hint?: string;
};

export type RemotionRenderPreviewResponse =
  | RemotionRenderPreviewSuccess
  | RemotionRenderPreviewFailure;

/** Body for `remotion-render-preview` — `inputProps` are forwarded to `remotion render --props`. */
export type RemotionRenderPreviewRequestBody = {
  files: RemotionCodingFile[];
  compositionId: string;
  inputProps?: Record<string, unknown>;
  /** If false, keep render silent (skip voice + fallback music bed). Default true. */
  includeAudio?: boolean;
  /** Sound-design markdown table; triggers post-render SFX synthesis via ffmpeg. */
  soundMd?: string;
  /** Voiceover markdown table; triggers post-render TTS via OpenAI speech API. */
  voiceMd?: string;
};
