import type { WidgetGenericFault } from "@skbkontur/loader-builder";
import type { Mode } from "./index.js";

export type ImportDependencies = {
  readonly container: HTMLElement;
  readonly mode: Mode;
};

export type WidgetImportFaults = WidgetGenericFault<"style-manager">;

export type JsLoaderGetDependenciesFaults = never;

export type DisposeFaults = never;

export type WidgetApi = {};
