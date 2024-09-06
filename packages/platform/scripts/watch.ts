import type { InputPluginOption, Plugin } from "rollup";
import { type UserConfig } from "vite";
import type { AppUserPaths } from "./AppUserPaths.js";
import { buildAll } from "./buildAll.js";
import type { Disposer } from "./Disposer.js";
import type { FullConfig } from "./FullConfig.js";
import { getArtifactPaths } from "./getArtifactPaths.js";
import { getFrameworkPaths } from "./getFrameworkPaths.js";
import { getViteInlineConfigs } from "./getViteInlineConfigs.js";
import { prepareNpmLoader } from "./npmLoader/prepareNpmLoader.js";
import { watchProgram } from "./npmLoader/typescript/watchProgram.js";
import { patchNpmLoaderExternals } from "./patchNpmLoaderExternals.js";
import { runPreviewServer } from "./runPreviewServer.js";

async function getPlugins(input: InputPluginOption): Promise<Plugin[]> {
  const awaited = await input;
  if (Array.isArray(awaited)) {
    const pluginsArray = await Promise.all(awaited.map(getPlugins));
    return pluginsArray.flatMap((p) => p);
  }

  return awaited ? [awaited] : [];
}

async function getWatchedConfig({ build, ...rest }: UserConfig): Promise<UserConfig> {
  const plugins = await getPlugins(build?.rollupOptions?.plugins);
  return {
    ...rest,
    build: {
      watch: {},
      ...build,
      rollupOptions: {
        ...build?.rollupOptions,
        plugins: plugins.filter((p) => p.name !== "sourcemaps"),
      },
    },
  };
}

type Result = {
  readonly address: string;
  readonly dispose: Disposer;
};

export async function watch(
  artifactsDirectory: ReadonlyArray<string>,
  { appNpmLoaderPaths, appVitePaths }: AppUserPaths,
  { sharedModules, playgroundConfig, jsLoaderConfig, widgetConfig }: FullConfig
): Promise<Result> {
  const { artifactsNpmLoaderDirectory, viteArtifactsPaths } = getArtifactPaths(artifactsDirectory);
  const { frameworkRuntimeDirectory } = getFrameworkPaths();

  const npmLoaderExternals = patchNpmLoaderExternals(sharedModules);
  const preparedProgram = await prepareNpmLoader(
    frameworkRuntimeDirectory,
    appNpmLoaderPaths,
    artifactsNpmLoaderDirectory,
    npmLoaderExternals
  );
  const npmLoaderDispose = watchProgram(preparedProgram);

  const { createPlaygroundConfig, createJsLoaderConfig, widgetViteConfig } = await getViteInlineConfigs(
    frameworkRuntimeDirectory,
    viteArtifactsPaths,
    appVitePaths,
    npmLoaderExternals,
    playgroundConfig,
    jsLoaderConfig,
    widgetConfig
  );

  const watchedWidgetConfig = await getWatchedConfig(widgetViteConfig);
  const viteDispose = await buildAll(
    async (jsLoaderUrlInfo) => await getWatchedConfig(await createPlaygroundConfig(jsLoaderUrlInfo)),
    (widgetBundle) => getWatchedConfig(createJsLoaderConfig(widgetBundle)),
    watchedWidgetConfig
  );

  const previewServer = runPreviewServer(viteArtifactsPaths, playgroundConfig.port);

  return {
    address: previewServer.address,
    async dispose() {
      previewServer.dispose();
      await viteDispose();
      npmLoaderDispose();
    },
  };
}
