import type { AppVitePaths } from "./getViteInlineConfigs.js";
import type { UserAppNpmLoaderPaths } from "./npmLoader/prepareNpmLoader.js";

export type AppUserPaths = {
  readonly appNpmLoaderPaths: UserAppNpmLoaderPaths;
  readonly appVitePaths: AppVitePaths;
};
