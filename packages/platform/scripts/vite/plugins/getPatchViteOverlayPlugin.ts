import type { Plugin } from "vite";
import { getPatchStringPlugin } from "./getPatchStringPlugin.js";

export function getPatchViteOverlayPlugin(type: string): Plugin {
  return getPatchStringPlugin(/vite.+client[\\/]client\.mjs/, "vite-error-overlay", `vite-error-overlay-${type}`);
}
