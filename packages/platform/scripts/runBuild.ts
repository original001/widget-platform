import type { AppUserPaths } from "./AppUserPaths.js";
import { buildAll } from "./buildAll.js";
import { buildNpmLoader } from "./buildNpmLoader.js";
import type { FullConfig } from "./FullConfig.js";
import type { AllArtifactPaths } from "./getArtifactPaths.js";
import { getFrameworkPaths } from "./getFrameworkPaths.js";
import { getViteInlineConfigs } from "./getViteInlineConfigs.js";
import { patchNpmLoaderExternals } from "./patchNpmLoaderExternals.js";

export async function runBuild(
  { artifactsNpmLoaderDirectory, viteArtifactsPaths }: AllArtifactPaths,
  { appNpmLoaderPaths, appVitePaths }: AppUserPaths,
  { sharedModules, playgroundConfig, jsLoaderConfig, widgetConfig }: FullConfig
): Promise<void> {
  const { frameworkRuntimeDirectory } = getFrameworkPaths();

  const npmLoaderExternals = patchNpmLoaderExternals(sharedModules);

  await buildNpmLoader(artifactsNpmLoaderDirectory, appNpmLoaderPaths, npmLoaderExternals, frameworkRuntimeDirectory);

  const { createPlaygroundConfig, createJsLoaderConfig, widgetViteConfig } = await getViteInlineConfigs(
    frameworkRuntimeDirectory,
    viteArtifactsPaths,
    appVitePaths,
    npmLoaderExternals,
    playgroundConfig,
    jsLoaderConfig,
    widgetConfig
  );

  const disposer = await buildAll(
    createPlaygroundConfig,
    async (widgetBundle) => createJsLoaderConfig(widgetBundle),
    widgetViteConfig
  );
  await disposer();
}
