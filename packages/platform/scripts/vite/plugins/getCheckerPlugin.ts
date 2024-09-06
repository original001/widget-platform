import type { BuiltInCheckers } from "@skbkontur/widget-platform";
import type { Plugin } from "vite";
import checker from "vite-plugin-checker";
import { getPatchStringPlugin } from "./getPatchStringPlugin.js";

// https://github.com/fi3ework/vite-plugin-checker/issues/305
export function getCheckerPlugin(position: "tl" | "tr" | "bl" | "br", checkersConfig: BuiltInCheckers): Plugin[] {
  return [
    getPatchStringPlugin(
      /vite-plugin-checker-runtime/,
      "vite-plugin-checker-error-overlay",
      `vite-plugin-checker-error-overlay-${position}`
    ),
    checker({
      overlay: {
        initialIsOpen: false,
        position,
      },
      ...checkersConfig,
    }),
  ];
}
