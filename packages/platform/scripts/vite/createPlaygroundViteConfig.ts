import { indexHtmlCloner } from "@skbkontur/vite-plugin-index-html-cloner";
import type { BuiltInCheckers } from "@skbkontur/widget-platform";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "fs";
import { resolve } from "path";
import sourcemaps from "rollup-plugin-sourcemaps";
import type { SecureContextOptions } from "tls";
import type { UserConfig } from "vite";
import type { PlaygroundDefines } from "../../runtime/framework/playground/define.js";
import type { JsLoaderUrlInfo } from "../JsLoaderUrlInfo.js";
import { previewHtmlName } from "../previewHtmlName.js";
import { browserslistResult, createServer, getVisualizerInAnalyzeMode } from "./common.js";
import { type ConfigDescription, viteAppendConfigScripts } from "./plugins/appendConfigScripts.js";
import { getCheckerPlugin } from "./plugins/getCheckerPlugin.js";
import { getPatchViteOverlayPlugin } from "./plugins/getPatchViteOverlayPlugin.js";
import { moveFilesToFolder } from "./plugins/moveFilesToFolderPlugin.js";
import { redirectIndexHtmlInDevMode } from "./plugins/redirectIndexHtmlInDevModePlugin.js";
import type { CommonArtifactsDirectories } from "./types.js";

type ConfigCoordinates = {
  htmlNameToConfigDescription: Record<string, ConfigDescription>;
};

async function getConfigCoordinates(
  htmlNameToConfigFunc: Record<string, string>,
  frameworkRuntimePlaygroundDirectory: ReadonlyArray<string>,
  rootDir: ReadonlyArray<string>
): Promise<ConfigCoordinates> {
  const wrapperPath = resolve(...frameworkRuntimePlaygroundDirectory, "wrapConfigs.ts");
  const envConfigsPath = resolve(...rootDir, "environmentConfigs.ts");

  const usersHtmlToConfigDescr = Object.fromEntries(
    Object.entries(htmlNameToConfigFunc).map(([html, func]) => [
      html,
      {
        filePath: envConfigsPath,
        funcName: func,
      } satisfies ConfigDescription,
    ])
  );
  const allHtmlToConfigDescr: Record<string, ConfigDescription> = {
    ...usersHtmlToConfigDescr,
    [previewHtmlName]: {
      filePath: wrapperPath,
      funcName: "getDevConfig",
    },
  };
  return {
    htmlNameToConfigDescription: allHtmlToConfigDescr,
  };
}

// и для сбилженных конфигов, и для превью, и для дева
function getDefines(info: JsLoaderUrlInfo): PlaygroundDefines {
  return {
    jsLoaderDevConfigBase: info.basePath, // "./widget/" | "https://localhost...:1234/"
    jsLoaderSuffix: info.suffix, // "loader.js" | "./.../entryDev.ts"
  };
}

export async function createPlaygroundViteConfig(
  outDir: string,
  { artifactsCacheDirectory, artifactsStatsDirectory }: CommonArtifactsDirectories,
  rootDir: ReadonlyArray<string>,
  frameworkRuntimePlaygroundDirectory: ReadonlyArray<string>,
  playgroundPreviewDirectory: ReadonlyArray<string>,
  htmlConfigs: Record<string, string>,
  httpsSecureContextOptions: SecureContextOptions,
  port: number | undefined,
  checkersConfig: BuiltInCheckers,
  jsLoaderUrlInfo: JsLoaderUrlInfo
): Promise<UserConfig> {
  const path = resolve(...frameworkRuntimePlaygroundDirectory, "index.ts");
  const root = resolve(...rootDir);
  const configPaths = await getConfigCoordinates(htmlConfigs, frameworkRuntimePlaygroundDirectory, rootDir);
  const defines = getDefines(jsLoaderUrlInfo);
  return {
    root,
    base: "./",
    server: {
      ...createServer(httpsSecureContextOptions, root, [path]),
      ...(port === undefined ? {} : { port, strictPort: true }),
    },
    define: {
      jsLoaderDevConfigBase: JSON.stringify(defines.jsLoaderDevConfigBase),
      jsLoaderSuffix: JSON.stringify(defines.jsLoaderSuffix),
    } satisfies Record<keyof PlaygroundDefines, string>,
    cacheDir: resolve(...artifactsCacheDirectory, "playground-vite"),
    resolve: {
      alias: [
        {
          find: /^playground\/(.+)/,
          replacement: resolve(...rootDir, "$1"),
        },
      ],
    },
    build: {
      emptyOutDir: true,
      outDir,
      sourcemap: "hidden",
      minify: false,
      target: browserslistResult,
      rollupOptions: {
        output: {
          plugins: [getVisualizerInAnalyzeMode(artifactsStatsDirectory, "playground")],
        },
        plugins: [sourcemaps()],
      },
    },
    plugins: [
      redirectIndexHtmlInDevMode("/" + previewHtmlName), // должно быть до клонера, потому что он обслуживает после редиректа
      indexHtmlCloner({
        allHtmls: Object.keys(configPaths.htmlNameToConfigDescription),
        template: readFileSync(resolve(...frameworkRuntimePlaygroundDirectory, "template.html")).toString(),
      }),
      viteAppendConfigScripts(configPaths.htmlNameToConfigDescription, path),
      moveFilesToFolder(new RegExp(previewHtmlName, "g"), playgroundPreviewDirectory),
      react(),
      getCheckerPlugin("br", checkersConfig),
      getPatchViteOverlayPlugin("playground"),
    ],
  };
}
