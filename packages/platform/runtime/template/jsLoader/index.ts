import { createSuccess } from "@skbkontur/operation-result";
import { getCSP, UNSAFE_INLINE } from "csp-header";
import type { GenerateCsp, GetJsLoaderDependencies } from "../../npm-loader/internal/index.js";

export type JsLoaderImportDependencies = {};

export const getJsLoaderDependencies: GetJsLoaderDependencies<JsLoaderImportDependencies> = async () =>
  createSuccess({});

export const generateCsp: GenerateCsp<JsLoaderImportDependencies> = () =>
  getCSP({
    directives: {
      "default-src": ["*", UNSAFE_INLINE],
    },
  });
