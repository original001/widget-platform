import type { JsLoaderDependencies } from "../../lib/node/config.js";

export type AllExternals = {
  readonly npmLoaderExternals: ReadonlyArray<string>;
  readonly jsLoaderExternals: JsLoaderDependencies;
};

export type CommonArtifactsDirectories = {
  readonly artifactsCacheDirectory: ReadonlyArray<string>;
  readonly artifactsStatsDirectory: ReadonlyArray<string>;
};
