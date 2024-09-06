import { resolve } from "path";
import type { UserConfig } from "vite";
import type { JsLoaderConfig, PlaygroundConfig, WidgetConfig } from "../lib/node/config.js";
import { getHttpsSecureContentOptions } from "./getHttpsSecureContentOptions.js";
import type { JsLoaderUrlInfo } from "./JsLoaderUrlInfo.js";
import { patchAppConfig, patchJsLoaderConfig } from "./verifyTsConfig/patchTsConfig.js";
import { createJsLoaderViteConfig, type WidgetInfo } from "./vite/createJsLoaderViteConfig.js";
import { createPlaygroundViteConfig } from "./vite/createPlaygroundViteConfig.js";
import { createWidgetViteConfig } from "./vite/createWidgetViteConfig.js";

export type AppVitePaths = {
  readonly appPlaygroundDirectory: ReadonlyArray<string>;
  readonly appJsLoaderDirectory: ReadonlyArray<string>;
  readonly appWidgetDirectory: ReadonlyArray<string>;
};

export type ViteArtifactsPaths = {
  readonly artifactsPlaygroundDirectory: string;
  readonly artifactsWidgetAndLoaderDirectory: string;
  readonly artifactsStatsDirectory: ReadonlyArray<string>;
  readonly artifactsCacheDirectory: ReadonlyArray<string>;
  readonly playgroundPreviewDirectory: ReadonlyArray<string>;
};

type Result = {
  frameworkRuntimeJsLoaderDirectory: ReadonlyArray<string>;
  frameworkRuntimeWidgetDirectory: ReadonlyArray<string>;
  frameworkRuntimeWidgetEntryPoint: string;
  createPlaygroundConfig: (jsLoaderUrlInfo: JsLoaderUrlInfo) => Promise<UserConfig>;
  createJsLoaderConfig: (widgetInfo: WidgetInfo) => UserConfig;
  widgetViteConfig: UserConfig;
};

export async function getViteInlineConfigs(
  frameworkRuntimeDirectory: ReadonlyArray<string>,
  {
    artifactsPlaygroundDirectory,
    artifactsWidgetAndLoaderDirectory,
    artifactsStatsDirectory,
    artifactsCacheDirectory,
    playgroundPreviewDirectory,
  }: ViteArtifactsPaths,
  { appPlaygroundDirectory, appJsLoaderDirectory, appWidgetDirectory }: AppVitePaths,
  npmLoaderExternals: ReadonlyArray<string>,
  playgroundConfig: PlaygroundConfig,
  jsLoaderConfig: JsLoaderConfig,
  widgetConfig: WidgetConfig
): Promise<Result> {
  await patchAppConfig(appPlaygroundDirectory);
  await patchJsLoaderConfig(appJsLoaderDirectory);
  await patchAppConfig(appWidgetDirectory);

  const externals = { npmLoaderExternals, jsLoaderExternals: jsLoaderConfig.sharedModules };

  const frameworkDirectory = [...frameworkRuntimeDirectory, "framework"];
  const frameworkRuntimeJsLoaderDirectory = [...frameworkDirectory, "jsLoader"];
  const frameworkRuntimeWidgetDirectory = [...frameworkDirectory, "widget"];
  const frameworkRuntimeWidgetEntryPoint = resolve(...frameworkRuntimeWidgetDirectory, "index.ts");

  const commonArtifactDirectories = {
    artifactsCacheDirectory,
    artifactsStatsDirectory,
  };

  const httpsSecureContextOptions = getHttpsSecureContentOptions();

  return {
    frameworkRuntimeJsLoaderDirectory,
    frameworkRuntimeWidgetDirectory,
    frameworkRuntimeWidgetEntryPoint,
    createPlaygroundConfig: (jsLoaderUrlInfo) =>
      createPlaygroundViteConfig(
        artifactsPlaygroundDirectory,
        commonArtifactDirectories,
        appPlaygroundDirectory,
        [...frameworkDirectory, "playground"],
        playgroundPreviewDirectory,
        playgroundConfig.htmlConfigs,
        httpsSecureContextOptions,
        playgroundConfig.port,
        playgroundConfig.checkersConfig,
        jsLoaderUrlInfo
      ),
    createJsLoaderConfig: (widgetInfo) =>
      createJsLoaderViteConfig(
        artifactsWidgetAndLoaderDirectory,
        commonArtifactDirectories,
        appJsLoaderDirectory,
        frameworkRuntimeJsLoaderDirectory,
        httpsSecureContextOptions,
        jsLoaderConfig.checkersConfig,
        externals,
        widgetInfo
      ),
    widgetViteConfig: createWidgetViteConfig(
      artifactsWidgetAndLoaderDirectory,
      commonArtifactDirectories,
      appWidgetDirectory,
      frameworkRuntimeWidgetDirectory,
      frameworkRuntimeWidgetEntryPoint,
      httpsSecureContextOptions,
      widgetConfig.checkersConfig,
      externals
    ),
  };
}
