import { createSuccess } from "@skbkontur/operation-result";
import type { BuiltInCheckers } from "@skbkontur/widget-platform";
import { resolve } from "path";
import sourcemaps from "rollup-plugin-sourcemaps";
import type { SecureContextOptions } from "tls";
import type { UserConfig } from "vite";
import type { Config } from "../../runtime/framework/jsLoader/define.js";
import { findSymbolById } from "../../runtime/framework/jsLoader/findSymbolById.js";
import type { WidgetBundle } from "../../runtime/framework/jsLoader/WidgetBundle.js";
import type {
  AllNpmLoaderDependencies,
  Externals,
  ProvideExternalsFault,
} from "../../runtime/npm-loader/framework/private.js";
import { internalFieldSymbolId } from "../../runtime/npm-loader/framework/private.js";
import { browserslistResult, createServer, getVisualizerInAnalyzeMode } from "./common.js";
import { createExternals } from "./createExternals.js";
import { generateJsLoaderDependencies } from "./generateJsLoaderDependencies.js";
import { exportLibraryAsEsm } from "./plugins/exportLibraryAsEsm.js";
import { getCheckerPlugin } from "./plugins/getCheckerPlugin.js";
import { getPatchViteOverlayPlugin } from "./plugins/getPatchViteOverlayPlugin.js";
import { importMetaUrlProtector } from "./plugins/importMetaUrlProtector.js";
import { provideExternalDependenciesViaClosure } from "./plugins/provideExternalDependenciesViaClosure.js";
import { virtualModulePlugin } from "./plugins/virtualModulePlugin.js";
import { vitePluginExternalsCustom } from "./plugins/vitePluginExternalsCustom.js";
import type { AllExternals, CommonArtifactsDirectories } from "./types.js";
import { widgetExposeExternalsWindowField } from "./widgetExposeExternalsWindowField.js";

export type WidgetInfo = {
  widgetServerUrl: string;
  widgetBundle: WidgetBundle;
};
export function createJsLoaderViteConfig(
  outDir: string,
  { artifactsCacheDirectory, artifactsStatsDirectory }: CommonArtifactsDirectories,
  rootDir: ReadonlyArray<string>,
  frameworkRuntimeJsLoaderDirectory: ReadonlyArray<string>,
  httpsSecureContextOptions: SecureContextOptions,
  checkersConfig: BuiltInCheckers,
  { npmLoaderExternals, jsLoaderExternals }: AllExternals,
  { widgetServerUrl, widgetBundle }: WidgetInfo
): UserConfig {
  const libraryName = "___EXPORT_JSLOADER_LIBRARY___";
  const entryName = resolve(...frameworkRuntimeJsLoaderDirectory, "entry.ts");

  const exposeVariableName = "jsLoaderVariableToPutExternals";

  const externals = createExternals(exposeVariableName, npmLoaderExternals);

  const widgetAllExternalsDescription = Object.entries(jsLoaderExternals)
    .map(([moduleName, importDescription]) => ({ moduleName, importDescription }))
    .concat(npmLoaderExternals.map((moduleName) => ({ moduleName, importDescription: { type: "namespace" } })));

  const root = resolve(...rootDir);
  return {
    root,
    base: "./",
    server: {
      ...createServer(httpsSecureContextOptions, root, [entryName]),
      port: 2012,
    },
    define: {
      __widgetPlatformFramework_jsloader_config__: {
        internalFieldSymbolId,
        widgetExposeExternalsWindowField,
        widgetServerUrl,
        widgetBundle,
      } satisfies Config<typeof widgetExposeExternalsWindowField>,
    },
    cacheDir: resolve(...artifactsCacheDirectory, "jsloader-vite"),
    resolve: {
      alias: {
        jsLoader: resolve(...rootDir, "index.ts"),
      },
    },
    build: {
      minify: true,
      sourcemap: "hidden",
      target: browserslistResult,
      outDir,
      emptyOutDir: false,
      rollupOptions: {
        preserveEntrySignatures: "allow-extension",
        input: entryName,
        output: {
          entryFileNames: "loader.js",
          name: libraryName,
          format: "iife",
          strict: false,
          plugins: [
            exportLibraryAsEsm({ libraryName }),
            getVisualizerInAnalyzeMode(artifactsStatsDirectory, "jsloader"),
          ],
        },
        plugins: [sourcemaps()],
      },
    },
    plugins: [
      importMetaUrlProtector(),
      virtualModulePlugin("/jsLoaderExternals.js", generateJsLoaderDependencies(widgetAllExternalsDescription)),
      vitePluginExternalsCustom(externals, {
        cacheDir: resolve(...artifactsCacheDirectory, "jsloader-externals"),
      }),
      provideExternalDependenciesViaClosure<
        AllNpmLoaderDependencies,
        {
          internalFieldSymbolId: string;
        },
        ProvideExternalsFault,
        { [TKey in keyof Externals]: Externals[TKey]["value"] }
      >(
        libraryName,
        exposeVariableName,
        { findSymbolById, createSuccess },
        { internalFieldSymbolId },
        async function (dependencies, { internalFieldSymbolId }) {
          const internalSymbol = findSymbolById(dependencies, internalFieldSymbolId);
          if (internalSymbol === null) {
            /**
             * @param key ключ в старом формате. Например, reactDom-widget-platform-template-external
             * @returns ключ в формате типа react/dom или @react/refresh
             */
            const transformKeyFormOldValue = (key: string) =>
              key
                .split("-")[0]!
                .replace("reactDom", "react-dom")
                .replace("reactJsxDevRuntime", "react/jsx-dev-runtime");

            const entries = Object.entries(dependencies).map(([moduleName, value]) => [
              transformKeyFormOldValue(moduleName),
              value,
            ]);
            return createSuccess(Object.fromEntries(entries));
          }

          const { externals } = dependencies[internalSymbol];

          const entries = Object.entries(externals).map(([moduleName, description]) => [moduleName, description.value]);
          return createSuccess(Object.fromEntries(entries));
        }
      ),
      getCheckerPlugin("tl", checkersConfig),
      getPatchViteOverlayPlugin("js-loader"),
    ],
  };
}
