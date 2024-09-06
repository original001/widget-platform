import { resolve } from "path";
import type { ViteArtifactsPaths } from "./getViteInlineConfigs.js";

export type AllArtifactPaths = {
  readonly artifactsNpmLoaderDirectory: ReadonlyArray<string>;
  readonly viteArtifactsPaths: ViteArtifactsPaths;
};

export function getArtifactPaths(artifactsDirectory: ReadonlyArray<string>): AllArtifactPaths {
  const cacheDir = [...artifactsDirectory, "cache"];
  return {
    artifactsNpmLoaderDirectory: [...artifactsDirectory, "npm-loader"],
    viteArtifactsPaths: {
      artifactsPlaygroundDirectory: resolve(...artifactsDirectory, "playground"),
      artifactsWidgetAndLoaderDirectory: resolve(...artifactsDirectory, "widget"),
      artifactsStatsDirectory: [...artifactsDirectory, "stats"],
      artifactsCacheDirectory: cacheDir,
      playgroundPreviewDirectory: [...cacheDir, "playground-preview-serve-files"],
    },
  };
}
