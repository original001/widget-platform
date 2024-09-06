import { createSuccess } from "@skbkontur/operation-result";
import type { CreateWidgetApi } from "../../npm-loader/internal/index.js";
import type { JsLoaderImportDependencies } from "../jsLoader/index.js";

const createWidgetApi: CreateWidgetApi<JsLoaderImportDependencies> = async () =>
  createSuccess({
    dispose: async () => createSuccess(undefined),
  });

export default createWidgetApi;
