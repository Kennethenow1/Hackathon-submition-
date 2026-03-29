import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

/** LLM agents (e.g. remotion-coding-agent) can run many minutes; Vite's default proxy timeout is 120s → 502. */
const FUNCTIONS_PROXY_MS = 1_800_000; // 30m, matches remotion-render-preview cap

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@content": path.join(repoRoot, "content"),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
    proxy: {
      "/.netlify/functions": {
        target: "http://127.0.0.1:9999",
        changeOrigin: true,
        timeout: FUNCTIONS_PROXY_MS,
        proxyTimeout: FUNCTIONS_PROXY_MS,
      },
    },
  },
});
