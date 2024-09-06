import type { Disposable, WidgetDependenciesConstraint } from "@skbkontur/loader-builder";
import type { OperationResult } from "@skbkontur/operation-result";
import type {
  DisposeFaults,
  ImportDependencies,
  WidgetApi as InternalWidgetApi,
  JsLoaderGetDependenciesFaults,
  WidgetImportFaults,
} from "../platformTypes.js";
import type { CreateWidgetApi as CreateWidgetApiInternal } from "./widget.js";

export type WidgetApi = Disposable<DisposeFaults> & InternalWidgetApi;
export type CreateWidgetApi<JsLoaderDependencies extends WidgetDependenciesConstraint> = CreateWidgetApiInternal<
  JsLoaderDependencies & ImportDependencies,
  WidgetImportFaults,
  WidgetApi
>;

export type GetJsLoaderDependencies<JsLoaderDependencies extends WidgetDependenciesConstraint> = (
  importDependencies: ImportDependencies
) => Promise<OperationResult<JsLoaderGetDependenciesFaults, JsLoaderDependencies>>;

export type GenerateCsp<JsLoaderDependencies extends WidgetDependenciesConstraint> = (
  widgetUrl: URL,
  dependencies: JsLoaderDependencies & ImportDependencies
) => string;
