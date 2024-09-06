import { createSuccess } from "@skbkontur/operation-result";
import { exportLibraryAsEsm, provideExternalDependenciesViaClosure } from "@skbkontur/widget-webpack-utils";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { Configuration } from "webpack";
import "webpack-dev-server";
import { playgroundHost, playgroundPort } from "../constants.js";
import { iframeLoaderEntryName } from "./src/jsLoader/iframeLoaderEntryName.js";
import type { TestDependencies } from "./src/npmLoader/TestDependencies.js";
import type { TestExternals } from "./src/npmLoader/TestExternals.js";
import { ScriptType } from "./src/playground/ScriptType.js";

import webpack = require("webpack");

function mapObjectValues<TValue, TResult>(
  source: Readonly<Record<string, TValue>>,
  project: (value: TValue) => TResult
): Record<string, TResult> {
  return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, project(value)]));
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function resolvePath(localPath: string): string {
  return resolve(__dirname, localPath);
}

const standardOutput = {
  filename: "[name].js",
  path: resolvePath("../.artifacts/webpack"),
};

const performanceWitReactCopy = {
  hints: false,
  maxEntrypointSize: 1024000,
} as const;

export default ({ production }: any): Configuration[] => {
  const commonConfig: Configuration = {
    mode: Boolean(production) ? "production" : "development",
    devtool: "source-map",
    resolve: {
      extensionAlias: {
        ".js": [".js", ".ts", ".tsx"],
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [/react-focus-lock/],
          use: {
            loader: "babel-loader",
            options: {
              plugins: [
                [
                  "transform-globals",
                  {
                    replace: {
                      document: "window.document",
                    },
                    import: {
                      "@skbkontur/global-object": {
                        window: "globalObject",
                      },
                    },
                  },
                ],
              ],
            },
          },
        },
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "ts-loader",
            options: {
              configFile: resolvePath("src/tsconfig.json"),
            },
          },
        },
        {
          test: /\.js$/,
          enforce: "pre",
          use: ["source-map-loader"],
        },
      ],
    },
  };

  function createWidgetConfigs(): Configuration[] {
    const enum ModuleNames {
      React = "react",
      ReactJsx = "react/jsx-runtime",
      ReactDom = "react-dom",
      ReactDomClient = "react-dom/client",
      UseSyncExternalStoreShim = "use-sync-external-store/shim",
      FocusLock = "focus-lock",
    }

    const performance = {
      maxEntrypointSize: 460800,
      maxAssetSize: 460800,
    } as const;

    const libraryName = "___EXPORT_BANNER_PLACEHOLDER___";
    const exportLibraryAsEsmPlugin = exportLibraryAsEsm({ libraryName });
    const widgetCommonConfig = {
      ...commonConfig,
      output: {
        ...standardOutput,
        scriptType: "module",
        library: {
          name: libraryName,
          type: "var",
        },
      } as const,
    } as const;

    const moduleNameToTestExternalsMap: Record<ModuleNames, keyof TestExternals> = {
      [ModuleNames.React]: "react",
      [ModuleNames.ReactJsx]: "reactJsxRuntime",
      [ModuleNames.ReactDom]: "reactDOM",
      [ModuleNames.ReactDomClient]: "reactDOMClient",
      [ModuleNames.UseSyncExternalStoreShim]: "useSyncExternalStoreShim",
      [ModuleNames.FocusLock]: "focusLock",
    };

    const widgetReactEntry = resolvePath("src/widget/react/entry.tsx");

    function createClosureExternalsConfig(): Configuration {
      const exposeVariableName = "__dynamicExternals__";
      const { plugins } = provideExternalDependenciesViaClosure<TestDependencies, {}, never, TestExternals>({
        libraryName,
        exposeVariableName,
        imports: { createSuccess },
        data: {},
        externalsCalculator: async ({ externals }) => createSuccess(externals),
      });

      return {
        entry: {
          [ScriptType.ReactExternalsClosure]: widgetReactEntry,
        },
        plugins: [...plugins, exportLibraryAsEsmPlugin],
        externals: mapObjectValues(
          moduleNameToTestExternalsMap,
          (externalsName) => `${exposeVariableName}["${externalsName}"]`
        ),
        performance,
      };
    }

    return [
      createClosureExternalsConfig(),
      {
        entry: {
          [ScriptType.ReactExternalsWindow]: resolvePath("src/widget/react/windowExternalsEntry.ts"),
        },
        plugins: [exportLibraryAsEsmPlugin],
        externals: mapObjectValues(moduleNameToTestExternalsMap, (windowKey) => `window.externals["${windowKey}"]`),
        performance,
      },
      {
        entry: {
          [ScriptType.ReactDuplicate]: widgetReactEntry,
          [ScriptType.ExplicitDependency]: resolvePath("src/widget/entryExternalsImmer.ts"),
          [ScriptType.Plain]: resolvePath("src/widget/entryVanilla.ts"),
        },
        performance: performanceWitReactCopy,
        plugins: [exportLibraryAsEsmPlugin],
      },
    ].map((config) => ({ ...widgetCommonConfig, ...config }));
  }

  function createIframeLoaderConfig(): Configuration {
    const importMetaUrl = "import.meta.url";
    return {
      ...commonConfig,
      entry: {
        [iframeLoaderEntryName]: resolvePath("src/jsLoader/entry.ts"),
      },
      output: {
        ...standardOutput,
        module: true,
        library: {
          type: "module",
        },
        uniqueName: `${"iframe"}-for-module`,
        chunkFilename: `${"iframe"}.[name].[contenthash].js`,
      },
      experiments: {
        outputModule: true,
      },
      plugins: [new webpack.DefinePlugin({ [importMetaUrl]: importMetaUrl })],
    };
  }

  return [
    {
      ...commonConfig,
      output: standardOutput,
      entry: {
        playground: resolvePath("src/playground/entry.tsx"),
      },
      devServer: {
        host: playgroundHost,
        port: playgroundPort,
        static: resolvePath("public"),
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
      performance: performanceWitReactCopy,
    },
    createIframeLoaderConfig(),
    ...createWidgetConfigs(),
  ];
};
