import type { OperationResult } from "@skbkontur/operation-result";
import { createFailure, createSuccess, isSuccess, tryExecute } from "@skbkontur/operation-result";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { Configuration } from "webpack";
import "webpack-dev-server";
import { playgroundHost, playgroundPort } from "../constants.js";
import { exportLibraryAsEsm, provideExternalDependenciesViaClosure } from "../esm/index.js";
import type { Imports } from "../esm/provideExternalDependenciesViaClosure.js";
import type { TestExternals } from "./src/npmLoader/TestExternals.js";
import type { ChooseExternalsFault, TestDependencies } from "./src/npmLoader/types.js";
import { ExternalsType } from "./src/playground/ExternalsType.js";

import webpack = require("webpack");

function mapObjectValues<TValue, TResult>(
  source: Readonly<Record<string, TValue>>,
  project: (value: TValue) => TResult
): Record<string, TResult> {
  return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, project(value)]));
}

function escapeForRegex(str: string): string {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}

function createExactStringRegEx(moduleName: string): RegExp {
  return new RegExp(`^${escapeForRegex(moduleName)}$`);
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

  function createEsmConfig(uniqueName: string): Configuration {
    return {
      output: {
        ...standardOutput,
        module: true,
        library: {
          type: "module",
        },
        uniqueName: `${uniqueName}-for-module`,
        chunkFilename: `${uniqueName}.[name].[contenthash].js`,
      },
      experiments: {
        outputModule: true,
      },
    };
  }

  const onlyExternalsEntry = "onlyExternalsEntry";

  function createWidgetConfigs(): Configuration[] {
    const enum ModuleNames {
      React = "react",
      ReactJsx = "react/jsx-runtime",
      ReactDom = "react-dom",
      ReactDomClient = "react-dom/client",
    }

    const performance = {
      maxEntrypointSize: 460800,
      maxAssetSize: 460800,
    } as const;

    const libraryName = "___EXPORT_BANNER_PLACEHOLDER___";

    const exportLibraryAsEsmPlugin = exportLibraryAsEsm({ libraryName });
    const configureLibraryOutput = {
      ...standardOutput,
      scriptType: "module",
      library: {
        name: libraryName,
        type: "var",
      },
    } as const;

    function createChunkedOutput(uniqueName: string) {
      return {
        ...configureLibraryOutput,
        uniqueName: `${uniqueName}-for-module`,
        chunkFilename: `${uniqueName}.[name].[contenthash].js`,
      };
    }

    function createModuleExternalsConfigs(): Configuration[] {
      const plugins = Object.entries({
        [ModuleNames.React]: "react",
        [ModuleNames.ReactJsx]: "reactJsxRuntime",
        [ModuleNames.ReactDom]: "reactDOM",
        [ModuleNames.ReactDomClient]: "reactDOMClient",
      }).map(
        ([moduleName, modulePath]) =>
          new webpack.NormalModuleReplacementPlugin(
            createExactStringRegEx(moduleName),
            resolvePath(`src/widget/moduleExternals/modules/${modulePath}.ts`)
          )
      );

      const entryLazy = resolvePath("src/widget/moduleExternals/entryLazy.ts");
      const entry = resolvePath("src/widget/moduleExternals/entry.ts");

      return [
        {
          entry: {
            [ExternalsType.ModuleEsmLazy]: entryLazy,
            [ExternalsType.ModuleEsm]: entry,
          },
          ...createEsmConfig("module-esm"),
          plugins,
          performance,
        },
        {
          entry: {
            [ExternalsType.ModuleLazy]: entryLazy,
            [ExternalsType.Module]: entry,
          },
          output: createChunkedOutput("module"),
          plugins: [exportLibraryAsEsmPlugin, ...plugins],
          performance,
        },
      ];
    }

    const moduleNameToTestExternalsMap: Record<ModuleNames, keyof TestExternals> = {
      [ModuleNames.React]: "react",
      [ModuleNames.ReactJsx]: "reactJsxRuntime",
      [ModuleNames.ReactDom]: "reactDOM",
      [ModuleNames.ReactDomClient]: "reactDOMClient",
    };

    function createWindowExternalsConfigs(): Configuration[] {
      const externals = mapObjectValues(
        moduleNameToTestExternalsMap,
        (windowKey) => `window.externals["${windowKey}"]`
      );

      const entryLazy = resolvePath("src/widget/windowExternals/entryLazy.ts");
      const entry = resolvePath("src/widget/windowExternals/entry.ts");
      return [
        {
          entry: {
            [ExternalsType.WindowEsmLazy]: entryLazy,
            [ExternalsType.WindowEsm]: entry,
          },
          ...createEsmConfig("window-esm"),
          externalsType: "var",
          externals,
          performance,
        },
        {
          entry: {
            [ExternalsType.WindowLazy]: entryLazy,
            [ExternalsType.Window]: entry,
          },
          output: createChunkedOutput("window"),
          plugins: [exportLibraryAsEsmPlugin],
          externals,
          performance,
        },
      ];
    }

    const widgetReactEntry = resolvePath("src/widget/entry.tsx");

    function createClosureExternalsConfigs<TData extends {}>(
      standardExternalsType: ExternalsType,
      lazyExternalsType: ExternalsType,
      uniqueName: string,
      data: TData,
      imports: Imports,
      externalsCalculator: (
        dependencies: TestDependencies,
        data: TData
      ) => Promise<OperationResult<ChooseExternalsFault, TestExternals>>
    ): Configuration[] {
      const exposeVariableName = "__dynamicExternals__";
      const { plugins } = provideExternalDependenciesViaClosure({
        libraryName,
        exposeVariableName,
        data,
        imports,
        externalsCalculator,
      });

      const externals = mapObjectValues(
        moduleNameToTestExternalsMap,
        (externalsName) => `${exposeVariableName}["${externalsName}"]`
      );

      return [
        {
          entry: {
            [lazyExternalsType]: resolvePath("src/widget/entryLazy.ts"),
            [standardExternalsType]: widgetReactEntry,
          },
          output: createChunkedOutput(uniqueName),
          plugins: [...plugins, exportLibraryAsEsmPlugin],
          externals,
          performance,
        },
      ];
    }

    return [
      ...createModuleExternalsConfigs(),
      ...createWindowExternalsConfigs(),
      ...createClosureExternalsConfigs(
        ExternalsType.Closure,
        ExternalsType.ClosureLazy,
        "closure-reuse",
        {},
        { createSuccess },
        async ({ externals }) => createSuccess(externals)
      ),
      ...createClosureExternalsConfigs(
        ExternalsType.ClosureDuplicate,
        ExternalsType.ClosureDuplicateLazy,
        "closure-duplicate",
        { onlyExternalsEntry },
        { isSuccess, createFailure, createSuccess, tryExecute },
        async ({}, { onlyExternalsEntry }) => {
          const result = await tryExecute(() => import(`/${onlyExternalsEntry}.js`));
          return isSuccess(result)
            ? createSuccess(result.value.externals)
            : createFailure({
                type: "choose-externals",
                message: String(result.fault),
              });
        }
      ),
      {
        entry: {
          [ExternalsType.Duplicate]: widgetReactEntry,
        },
        performance: performanceWitReactCopy,
        output: configureLibraryOutput,
        plugins: [exportLibraryAsEsmPlugin],
      },
    ].map((config) => ({ ...commonConfig, ...config }));
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
    {
      ...commonConfig,
      entry: {
        [onlyExternalsEntry]: resolvePath("src/onlyExternalsEntry.ts"),
      },
      ...createEsmConfig("onlyExternalsEntryUnique"),
    } as const,
    ...createWidgetConfigs(),
  ];
};
