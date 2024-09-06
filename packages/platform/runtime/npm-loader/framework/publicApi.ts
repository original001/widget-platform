import { importWidgetModule as importModule } from "@skbkontur/loader-builder";
import type {
  AddImportWidgetModuleFaults,
  AddImportWidgetModuleViaIFrameDisposeFaults,
  Disposable,
} from "@skbkontur/loader-builder";
import type { OperationResult } from "@skbkontur/operation-result";
import type {
  ImportDependencies,
  DisposeFaults as InternalDisposeFaults,
  WidgetApi as InternalWidgetApi,
} from "../platformTypes.js";
import externals from "./dependencies.js";
import type {
  AllNpmLoaderDependencies,
  ConfigureIframeDisposeFaults,
  JsLoaderImportFaults,
  ProvideExternalsFault,
} from "./private.js";
import { internalFieldSymbol } from "./private.js";

export type ImportParams = {
  readonly widgetUrl: URL;
} & ImportDependencies;

export type ImportFaults = AddImportWidgetModuleFaults<JsLoaderImportFaults | ProvideExternalsFault>;

export type DisposeFaults = AddImportWidgetModuleViaIFrameDisposeFaults<
  InternalDisposeFaults,
  ConfigureIframeDisposeFaults
>;

export type WidgetApi = Disposable<DisposeFaults> & InternalWidgetApi;

export function importWidgetModule({
  widgetUrl,
  ...importDependencies
}: ImportParams): Promise<OperationResult<ImportFaults, WidgetApi>> {
  return importModule<AllNpmLoaderDependencies, JsLoaderImportFaults, WidgetApi>({
    widgetUrl,
    dependencies: {
      ...importDependencies,
      [internalFieldSymbol]: {
        externals,
      },
    },
  });
}
