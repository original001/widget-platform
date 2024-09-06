import { addStyleRoot } from "./styleManager.js";
import type { CreateWidgetApi } from "@skbkontur/loader-builder";
import type { JsLoaderImportDependencies } from "jsLoader";
import createUserWidgetApi from "widget";
import type { WidgetApi } from "../../npm-loader/internal/index.js";
import type { ImportDependencies, WidgetImportFaults } from "../../npm-loader/platformTypes.js";

export const createWidgetApi: CreateWidgetApi<
  ImportDependencies & JsLoaderImportDependencies,
  WidgetImportFaults,
  WidgetApi
> = async ({ dependencies }) =>
  createUserWidgetApi({
    dependencies: {
      ...dependencies,
      addStyleRoot,
    },
  });
