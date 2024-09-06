import type {
  AddImportWidgetModuleViaIFrameFaults,
  UnexpectedFault,
  WidgetGenericFault,
} from "@skbkontur/loader-builder";
import type { ImportDependencies, JsLoaderGetDependenciesFaults, WidgetImportFaults } from "../platformTypes.js";
import externals from "./dependencies.js";

export const internalFieldSymbolId = "internalField";
export const internalFieldSymbol: unique symbol = Symbol(internalFieldSymbolId);
export type InternalFieldSymbol = typeof internalFieldSymbol;

export type Externals = typeof externals;
export type AllNpmLoaderDependencies = ImportDependencies & {
  readonly [internalFieldSymbol]: {
    readonly externals: Externals;
  };
};

export type ConfigureIframeFaults = UnexpectedFault;
export type ConfigureIframeDisposeFaults = never;

export type JsLoaderImportFaults = AddImportWidgetModuleViaIFrameFaults<
  WidgetImportFaults | JsLoaderGetDependenciesFaults,
  ConfigureIframeFaults
>;

export type ProvideExternalsFault = WidgetGenericFault<"provide-externals">;
