import type { WidgetDependenciesConstraint, WidgetFaultConstraint } from "@skbkontur/loader-builder";
import type { OperationResult } from "@skbkontur/operation-result";
import { EOL } from "os";
import { URLSearchParams } from "url";
import type { Plugin } from "vite";
import { addToEntryChunk } from "./addToEntryChunk.js";

export const provideExternalsQueryParam = "provideExternals";

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

type Imports = Record<string, (...args: ReadonlyArray<never>) => void>;

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

function parseId(id: string) {
  const [url, query] = id.split("?");
  const search = new URLSearchParams(query);
  return { url, my: search.has(provideExternalsQueryParam) };
}

export function provideExternalDependenciesViaClosure<
  TDependencies extends WidgetDependenciesConstraint,
  TData extends JSON,
  TFault extends WidgetFaultConstraint,
  TExternals extends Record<string, unknown>,
>(
  libraryName: string,
  exposeVariableName: string,
  imports: Imports,
  data: TData,
  externalsCalculator: (dependencies: TDependencies, data: TData) => Promise<OperationResult<TFault, TExternals>>
): Plugin[] {
  return [
    {
      name: "vite-plugin-provide-dependencies-via-clojure-prod",
      banner: addToEntryChunk(
        [
          `const ${libraryName} = {`,
          "  async createWidgetApi(...__createWidgetApiArgs__) {",
          ...exposeCalculatedExternals(exposeVariableName, imports, data, externalsCalculator),
        ].join(EOL)
      ),
      footer: addToEntryChunk(
        [`    return await ${libraryName}.createWidgetApi(...__createWidgetApiArgs__);`, "  }", "};"].join(EOL)
      ),
    },
    {
      name: "vite-plugin-provide-dependencies-via-clojure-dev",
      enforce: "pre",
      resolveId(id): string | void {
        if (parseId(id).my) {
          return id;
        }
      },
      load(id): string | void {
        const { url, my } = parseId(id);
        if (my) {
          return [
            "export async function createWidgetApi(...__createWidgetApiArgs__) {",
            ...exposeCalculatedExternals(exposeVariableName, imports, data, externalsCalculator),
            `  window["${exposeVariableName}"] = ${exposeVariableName};`,
            `  const {createWidgetApi} = await import("${url}");`,
            "  return await createWidgetApi(...__createWidgetApiArgs__);",
            "}",
          ].join(EOL);
        }
      },
    },
  ];
}
