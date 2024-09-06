import { iframeInlineScriptCspHash } from "@skbkontur/loader-builder";
import { createSuccess } from "@skbkontur/operation-result";
import { getCSP, NONE } from "csp-header";
import type { GenerateCsp, GetJsLoaderDependencies } from "../.artifacts/npm-loader/internal/index.js";
import type { JsLoaderImportDependencies } from "./JsLoaderImportDependencies.js";

export const getJsLoaderDependencies: GetJsLoaderDependencies<JsLoaderImportDependencies> = async () =>
  createSuccess({});

export const generateCsp: GenerateCsp<JsLoaderImportDependencies> = (widgetUrl) =>
  getCSP({
    directives: {
      "connect-src": [`https://${widgetUrl.hostname}:*`, `wss://${widgetUrl.hostname}:*`],
      "script-src": [iframeInlineScriptCspHash, widgetUrl.origin],
      "default-src": [NONE],
    },
  });
