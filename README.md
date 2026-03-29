# AI Slop Machine

End-to-end pipeline: **capture a website** → **AI-generated promo brief** (ideas, voice, sound, Remotion `prompt.md`) → **Remotion source code** from a coding agent → **local MP4 render** → **post-render voiceover** (ElevenLabs or OpenAI TTS + ffmpeg mux).

## Monorepo layout

| Path | Purpose |
|------|---------|
| `apps/web` | Vite + React UI (`/create`, `/create/generate`, `/create/remotion`, `/create/video`) |
| `packages/remotion` | Remotion compositions, shared components, `Root.tsx` |
| `netlify/functions` | Serverless API: generating agent, Remotion coding agent, capture, render preview, audio |
| `agent-context/remotion` | Vendored Remotion skill (markdown rules) loaded into the coding agent — see [`agent-context/README.md`](agent-context/README.md) |
| `scripts/serve-functions.mjs` | Local dev server for `/.netlify/functions/*` (port **9999**) |

## Prerequisites

- **Node.js 20** (matches Netlify build)
- **ffmpeg** & **ffprobe** on `PATH` (voiceover mux after render)
- **Chrome/Chromium** for rendered capture — set `PUPPETEER_EXECUTABLE_PATH` locally if needed (see `.env.example`)

## Quick start

1. **Install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` at the repo root and set at least:

   - **Generating agent:** `OPENAI_API_KEY` (default backend) and/or `ANTHROPIC_API_KEY` if you use Claude
   - **Remotion coding agent:** `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` depending on provider
   - **Voiceover (optional):** `ELEVENLABS_API_KEY` (preferred) and/or `OPENAI_API_KEY` for TTS

   Full details: **`.env.example`**.

3. **Dev (web + functions)**

   ```bash
   npm run dev
   ```

   - **App:** [http://localhost:5173](http://localhost:5173) (Vite proxies `/.netlify/functions` → **9999**)
   - **Functions:** [http://127.0.0.1:9999](http://127.0.0.1:9999)

   Or run separately: `npm run dev:web` and `npm run dev:functions`.

## User flow

1. **Create** — Capture site HTML/CSS (static and/or headless render).
2. **Generate** — Generating agent produces `ideas_md`, `voice_md`, `sound_md`, `prompt_md` grounded in the bundle.
3. **Remotion** — Coding agent turns `prompt.md` (+ optional voice/sound) into files under `packages/remotion/` (JSON API; prefers `content_b64` for TSX).
4. **Video** — **Apply & render** runs `remotion render` locally, writes `apps/web/public/renders/latest.mp4`, then runs the **audio pipeline** (TTS + mux) when `voice_md` is included.

> **Render + preview** need the monorepo on disk with dev running. Hosted Netlify deploys do not bundle the Remotion CLI for full renders; use local `npm run dev` for that path.

## Netlify functions

| Function | Role |
|----------|------|
| `generating-agent` | Tool loop: site slices → markdown artifacts |
| `remotion-coding-agent` | `prompt.md` → proposed Remotion files |
| `capture-static` / `capture-rendered` | Fetch or Puppeteer capture |
| `remotion-render-preview` | Write files, `remotion render`, optional voice mux |
| Shared libs | `lib/audio-pipeline.mjs`, `lib/parse-llm-json.mjs`, `lib/load-remotion-skill.mjs`, etc. |

Timeouts and bundling are set in **`netlify.toml`**.

## Remotion package

```bash
cd packages/remotion
npx remotion studio src/index.ts    # Remotion Studio
npx remotion render src/index.ts <CompositionId> out.mp4
```

## Production build (web only)

```bash
npm run build --workspace=web
```

Netlify publish directory: `apps/web/dist` (see `netlify.toml`).

## License

Private project; add a license file if you open-source it.
