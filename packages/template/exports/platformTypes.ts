import type { RenderFunction } from "@skbkontur/loader-builder";
import type { InitParams } from "./index.js";
import type { RenderDisposeFault, RenderFault } from "./private.js";

export type ImportDependencies = {
  readonly apiUrl: URL;
  readonly account: string;
};

export type WidgetImportFaults = never;

export type JsLoaderGetDependenciesFaults = never;

export type DisposeFaults = never;

export type WidgetApi = {
  readonly render: RenderFunction<InitParams, RenderFault, RenderDisposeFault>;
};
