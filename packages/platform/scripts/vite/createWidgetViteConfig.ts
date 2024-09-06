import type { BuiltInCheckers } from "@skbkontur/widget-platform";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import type { GetManualChunk } from "rollup";
import sourcemaps from "rollup-plugin-sourcemaps";
import type { SecureContextOptions } from "tls";
import type { UserConfig } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import { operationResultModuleName, styleManagerFileName } from "../moduleNames.js";
import { browserslistResult, createServer, getVisualizerInAnalyzeMode } from "./common.js";
import { createExternals } from "./createExternals.js";
import { devAssetsImportMetaUrlAppender } from "./plugins/devAssetsImportMetaUrlAppender.js";
import { getCheckerPlugin } from "./plugins/getCheckerPlugin.js";
import { getPatchViteOverlayPlugin } from "./plugins/getPatchViteOverlayPlugin.js";
import { vitePluginExternalsCustom } from "./plugins/vitePluginExternalsCustom.js";
import type { AllExternals, CommonArtifactsDirectories } from "./types.js";
import { widgetExposeExternalsWindowField } from "./widgetExposeExternalsWindowField.js";

declare const window: Window;

const manualChunks: GetManualChunk = (id, { getModuleInfo }): string | void => {
  const vendors = "vendors";

  // Style manager and its dependencies should be in initial chunk because styles can be in initial chunk too
  if (id.endsWith(styleManagerFileName) || id.includes(operationResultModuleName)) {
    return vendors;
  }

  const visited: string[] = [];

  // Do not split dynamic import chunks
  function isEntryChunkModule(id: string) {
    const moduleInfo = getModuleInfo(id);
    if (moduleInfo === null) {
      throw Error(`'${id}' is invalid module id`);
    }

    if (moduleInfo.isEntry) {
      return true;
    }

    visited.push(id);
    return moduleInfo.importers.filter((id) => !visited.includes(id)).some(isEntryChunkModule);
  }

  if (isEntryChunkModule(id) && ["node_modules", "commonjsHelpers.js"].some((n) => id.includes(n))) {
    return id.includes("@skbkontur/") ? "kontur" : vendors;
  }
};

export function createWidgetViteConfig(
  outDir: string,
  { artifactsCacheDirectory, artifactsStatsDirectory }: CommonArtifactsDirectories,
  rootDir: ReadonlyArray<string>,
  frameworkRuntimeWidgetDirectory: ReadonlyArray<string>,
  frameworkRuntimeWidgetEntryPoint: string,
  httpsSecureContextOptions: SecureContextOptions,
  checkersConfig: BuiltInCheckers,
  { npmLoaderExternals, jsLoaderExternals }: AllExternals
): UserConfig {
  let styleId = 0;

  const externals = createExternals(
    widgetExposeExternalsWindowField,
    Object.keys(jsLoaderExternals).concat(npmLoaderExternals)
  );
  const root = resolve(...rootDir);
  return {
    root,
    base: "./",
    server: {
      ...createServer(httpsSecureContextOptions, root, [frameworkRuntimeWidgetEntryPoint]),
      port: 2112,
    },
    cacheDir: resolve(...artifactsCacheDirectory, "widget-vite"),
    resolve: {
      alias: [
        {
          find: "widget",
          replacement: resolve(...rootDir, "index.tsx"),
        },
        {
          find: /^\/framework\/(.+)/,
          replacement: resolve(...frameworkRuntimeWidgetDirectory, "$1"),
        },
      ],
    },
    build: {
      minify: true,
      sourcemap: "hidden",
      target: browserslistResult,
      emptyOutDir: true,
      rollupOptions: {
        preserveEntrySignatures: "allow-extension",
        input: frameworkRuntimeWidgetEntryPoint,
        output: {
          manualChunks,
          plugins: [getVisualizerInAnalyzeMode(artifactsStatsDirectory, "widget")],
        },
        plugins: [sourcemaps()],
      },
      outDir,
    },
    plugins: [
      react(),
      vitePluginExternalsCustom(externals, {
        cacheDir: resolve(...artifactsCacheDirectory, "widget-externals"),
      }),
      devAssetsImportMetaUrlAppender(),
      cssInjectedByJsPlugin({
        injectionCodeFormat: "es",
        topExecutionPriority: false,
        relativeCSSInjection: true,
        styleId: () => `${styleId++}`,
        injectCode(
          cssCode: string,
          { styleId, attributes }: { styleId: string; attributes: { "data-vite-dev-id": string } }
        ) {
          const id = styleId ?? attributes?.["data-vite-dev-id"];
          return `window.addStyle(${JSON.stringify(id)}, ${cssCode});`;
        },
        dev: {
          enableDev: true,
          removeStyleCodeFunction: function (id: string) {
            window.removeStyle(id);
          },
        },
      }),
      getCheckerPlugin("bl", checkersConfig),
      getPatchViteOverlayPlugin("widget"),
    ],
  };
}
