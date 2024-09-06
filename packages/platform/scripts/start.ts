import { resolve } from "path";
import type { UserConfig, ViteDevServer } from "vite";
import { createServer } from "vite";
import type { AppUserPaths } from "./AppUserPaths.js";
import type { Disposer } from "./Disposer.js";
import type { FullConfig } from "./FullConfig.js";
import { getAddress } from "./getAddress.js";
import { getArtifactPaths } from "./getArtifactPaths.js";
import { getFrameworkPaths } from "./getFrameworkPaths.js";
import { getViteInlineConfigs } from "./getViteInlineConfigs.js";
import { styleManagerFileName } from "./moduleNames.js";
import { prepareNpmLoader } from "./npmLoader/prepareNpmLoader.js";
import { watchProgram } from "./npmLoader/typescript/watchProgram.js";
import { patchNpmLoaderExternals } from "./patchNpmLoaderExternals.js";
import { serializeAddress } from "./serializeAddress.js";
import { generateViteFsPath } from "./vite/generateViteFsPath.js";
import { provideExternalsQueryParam } from "./vite/plugins/provideExternalDependenciesViaClosure.js";

async function run(config: UserConfig): Promise<ViteDevServer> {
  const server = await createServer(config);
  await server.listen();
  return server;
}

export type StartResult = {
  readonly playground: ViteDevServer;
  readonly dispose: Disposer;
};

export async function start(
  artifactsDirectory: ReadonlyArray<string>,
  { appNpmLoaderPaths, appVitePaths }: AppUserPaths,
  { sharedModules, playgroundConfig, jsLoaderConfig, widgetConfig }: FullConfig
): Promise<StartResult> {
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

  const {
    frameworkRuntimeJsLoaderDirectory,
    frameworkRuntimeWidgetDirectory,
    frameworkRuntimeWidgetEntryPoint,
    createPlaygroundConfig,
    createJsLoaderConfig,
    widgetViteConfig,
  } = await getViteInlineConfigs(
    frameworkRuntimeDirectory,
    viteArtifactsPaths,
    appVitePaths,
    npmLoaderExternals,
    playgroundConfig,
    jsLoaderConfig,
    widgetConfig
  );

  const widget = await run(widgetViteConfig);

  const jsLoaderViteConfig = createJsLoaderConfig({
    widgetServerUrl: serializeAddress(getAddress(widget)),
    widgetBundle: {
      entry: generateViteFsPath(frameworkRuntimeWidgetEntryPoint),
      preload: [generateViteFsPath(resolve(...frameworkRuntimeWidgetDirectory, styleManagerFileName))],
    },
  });
  const jsLoader = await run(jsLoaderViteConfig);

  const jsLoaderEntry = generateViteFsPath(resolve(...frameworkRuntimeJsLoaderDirectory, "entryDev.ts"));
  const params = new URLSearchParams();
  params.set(provideExternalsQueryParam, "true");
  const playgroundViteConfig = await createPlaygroundConfig({
    basePath: serializeAddress(getAddress(jsLoader)),
    suffix: `${jsLoaderEntry}?${params}`,
  });
  const playground = await run(playgroundViteConfig);
  return {
    playground,
    async dispose() {
      // Race inside server.warmup.clientFiles
      await playground.waitForRequestsIdle();
      await jsLoader.waitForRequestsIdle();
      await widget.waitForRequestsIdle();

      await playground.close();
      await jsLoader.close();
      await widget.close();

      npmLoaderDispose();
    },
  };
}
