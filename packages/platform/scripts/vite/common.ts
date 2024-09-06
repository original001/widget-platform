import browserslistToEsbuild from "browserslist-to-esbuild";
import { defaultImport } from "default-import";
import { relative, resolve } from "path";
import type { Plugin } from "rollup";
import { visualizer } from "rollup-plugin-visualizer";
import type { SecureContextOptions } from "tls";
import type { ServerOptions } from "vite";
import { normalizePath } from "vite";
import { defaultServiceHost } from "../defaultServiceHost.js";

export const browserslistResult = defaultImport(browserslistToEsbuild)(["supports es6-module-dynamic-import"]).map(
  (browser) => (browser.includes("safariTP") ? "safari11" : browser)
);

export const createServer = (
  https: SecureContextOptions,
  root: string,
  warmup: ReadonlyArray<string>
): ServerOptions => ({
  host: defaultServiceHost,
  https,
  warmup: {
    clientFiles: warmup.map((file) => normalizePath(relative(root, file))),
  },
});

export const getVisualizerInAnalyzeMode = (artifactsStatsDirectory: ReadonlyArray<string>, filename: string): Plugin =>
  visualizer({
    filename: resolve(...artifactsStatsDirectory, `${filename}.html`),
    sourcemap: true,
  });
