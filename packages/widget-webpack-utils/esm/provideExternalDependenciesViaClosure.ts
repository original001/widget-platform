import type { OperationResult } from "@skbkontur/operation-result";
import { EOL } from "os";
import type { BannerPlugin } from "webpack";
import { createAppendCodeToBundlePlugin } from "./createAppendCodeToBundlePlugin.js";

/**
 * Если точка входа чанка в бандле представима в виде константы libraryName с единственной функцией createWidgetApi в таком виде:
 *
 * ...произвольный код чанка
 * const libraryName = {
 *     createWidgetApi: async (...args) => { ... }
 * };
 *
 * То оборачивает такой чанк в функцию:
 *
 * const libraryName = {
 *     createWidgetApi: async (...__createWidgetApiArgs__) => {
 *        const __externalsVariableNameTemp__ = await <exposeCalculatedExternals>(__createWidgetApiArgs__[0].dependencies);
 *        if (!__externalsVariableNameTemp__.success)
 *          return __externalsVariableNameTemp__;
 *
 *        const externalsVariableName = const __externalsVariableNameTemp__.value;
 *
 *        // ниже оригинальный чанк
 *        ...произвольный код чанка
 *        const libraryName = {
 *          createWidgetApi: async (...args) => { ... }
 *        };
 *        // выше оригинальный чанк
 *
 *        return await libraryName.createWidgetApi(...__createWidgetApiArgs__);
 *    }
 * };
 *
 * Это не меняет внешний интерфейс бандла (библиотека с функцией называется как и раньше: libraryName и createWidgetApi).
 * Однако это позволяет в произвольном коде чанка использовать "глобальную" вычисленную переменную externalsVariableName в котором есть зависимости, которые можно использовать как externals.
 *
 */

type WidgetDependenciesConstraint = {
  readonly [key: string]: unknown;
};

export type WidgetFaultConstraint = {
  readonly type: string;
  readonly message: string;
};

type WidgetExternalsConstraint = {
  readonly [key: string]: unknown;
};

type JSON =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<JSON>
  | {
      // https://github.com/microsoft/TypeScript/pull/57293
      readonly [key: string]: JSON;
    };

export type Imports = Record<string, (...args: ReadonlyArray<never>) => void>;

function exposeCalculatedExternals<
  TDependencies extends WidgetDependenciesConstraint,
  TData extends JSON,
  TFault extends WidgetFaultConstraint,
  TExternals extends Record<string, unknown>,
>(
  exposeVariableName: string,
  imports: Imports,
  data: TData,
  externalsCalculator: (dependencies: TDependencies, data: TData) => Promise<OperationResult<TFault, TExternals>>
): string[] {
  const serializedFunctions = Object.entries(imports)
    .map(([functionName, functionBody]) => `var ${functionName} = (${functionBody.toString()});`)
    .join(EOL);

  return [
    `const __${exposeVariableName}__ = await (async function() {`,
    serializedFunctions,
    `  return await (${externalsCalculator})(__createWidgetApiArgs__[0].dependencies, ${JSON.stringify(data)});`,
    "})();",
    `if (!__${exposeVariableName}__.success) {`,
    `  return __${exposeVariableName}__;`,
    "}",
    `const ${exposeVariableName} = __${exposeVariableName}__.value;`,
  ];
}

type Params<TDependencies, TData, TFault, TExternals> = {
  readonly libraryName: string;
  readonly exposeVariableName: string;
  readonly imports: Imports;
  readonly data: TData;
  readonly externalsCalculator: (
    dependencies: TDependencies,
    data: TData
  ) => Promise<OperationResult<TFault, TExternals>>;
};

type Config = {
  plugins: BannerPlugin[];
};

export function provideExternalDependenciesViaClosure<
  TDependencies extends WidgetDependenciesConstraint,
  TData extends JSON,
  TFault extends WidgetFaultConstraint,
  TExternals extends WidgetExternalsConstraint,
>({
  libraryName,
  exposeVariableName,
  imports,
  data,
  externalsCalculator,
}: Params<TDependencies, TData, TFault, TExternals>): Config {
  return {
    plugins: [
      createAppendCodeToBundlePlugin(
        [
          `const ${libraryName} = {`,
          "  async createWidgetApi(...__createWidgetApiArgs__) {",
          ...exposeCalculatedExternals(exposeVariableName, imports, data, externalsCalculator),
        ].join(EOL),
        false
      ),
      createAppendCodeToBundlePlugin(
        [`    return await ${libraryName}.createWidgetApi(...__createWidgetApiArgs__);`, "  }", "};"].join(EOL),
        true
      ),
    ],
  };
}
