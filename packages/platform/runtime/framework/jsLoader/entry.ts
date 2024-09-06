import { type CreateWidgetApi, importWidgetModuleViaIframe } from "@skbkontur/loader-builder";
import { createFailure, createSuccess, isFailure } from "@skbkontur/operation-result";
import { generateCsp, getJsLoaderDependencies, type JsLoaderImportDependencies } from "jsLoader";
import type { WidgetApi } from "../../npm-loader/framework/entry.js";
import type {
  AllNpmLoaderDependencies,
  ConfigureIframeDisposeFaults,
  ConfigureIframeFaults,
  InternalFieldSymbol,
  JsLoaderImportFaults,
} from "../../npm-loader/framework/private.js";
import type { WidgetApi as InternalWidgetApi } from "../../npm-loader/internal/index.js";
import type { ImportDependencies, WidgetImportFaults } from "../../npm-loader/platformTypes.js";
import { combineUrl } from "./combineUrl.js";
import { externalsConfigurator } from "./configurators/externalsConfigurator.js";
import type { IframeConfigurator } from "./configurators/IframeConfigurator.js";
import { preloadConfigurator } from "./configurators/preloadConfigurator.js";
import { define } from "./define.js";
import { findSymbolById } from "./findSymbolById.js";

export const configurators: IframeConfigurator[] = [externalsConfigurator, preloadConfigurator];

function getUserDependencies(dependencies: AllNpmLoaderDependencies): ImportDependencies {
  const internalSymbol: InternalFieldSymbol | null = findSymbolById(dependencies, define.internalFieldSymbolId);
  if (internalSymbol === null) {
    return dependencies;
  }
  const { [internalSymbol]: _, ...npmLoaderUserDependencies } = dependencies;
  return npmLoaderUserDependencies;
}

export const createWidgetApi: CreateWidgetApi<AllNpmLoaderDependencies, JsLoaderImportFaults, WidgetApi> = async ({
  dependencies,
}) => {
  const npmLoaderUserDependencies = getUserDependencies(dependencies);
  const jsLoaderDependencies = await getJsLoaderDependencies(npmLoaderUserDependencies);
  if (isFailure(jsLoaderDependencies)) {
    return jsLoaderDependencies;
  }

  const widgetUrl = combineUrl(define.widgetBundle.entry);
  const allDependencies = { ...npmLoaderUserDependencies, ...jsLoaderDependencies.value };
  const cspConfigurator: IframeConfigurator = async ({ document }, signal) => {
    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = generateCsp(widgetUrl, allDependencies);
    document.head.appendChild(meta);

    signal.addEventListener("abort", () => document.head.removeChild(meta));
    return createSuccess(undefined);
  };

  return await importWidgetModuleViaIframe<
    ImportDependencies & JsLoaderImportDependencies,
    WidgetImportFaults,
    ConfigureIframeFaults,
    ConfigureIframeDisposeFaults,
    InternalWidgetApi
  >({
    widgetUrl,
    dependencies: allDependencies,
    document,
    async configureContentWindow(window) {
      const abortController = new AbortController();
      for (const configurator of [cspConfigurator, ...configurators]) {
        const configureResult = await configurator(window, abortController.signal);
        if (isFailure(configureResult)) {
          abortController.abort();
          return createFailure(configureResult.fault);
        }
      }

      return createSuccess({
        async dispose() {
          abortController.abort();
          return createSuccess(undefined);
        },
      });
    },
  });
};
