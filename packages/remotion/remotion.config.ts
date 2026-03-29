import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
/** Opaque — required for H.264 `.mp4` from `remotion-render-preview` → `latest.mp4`. */
Config.setPixelFormat("yuv420p");
