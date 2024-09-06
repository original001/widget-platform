import {
  createFailure,
  createSuccess,
  isFailure,
  isSuccess,
  tryExecute as tryExecuteSimple,
} from "@skbkontur/operation-result";
import type { OperationFailed, OperationResult, OperationSuccess } from "@skbkontur/operation-result";
import { aggregateFaults, type AggregateFaultsResult } from "../../aggregateFaults.js";
import { AsyncCancellationTokenSource } from "../../AsyncCancellationTokenSource.js";
import { callDisposeOnce } from "../../decorators/callDisposeOnce.js";
import type {
  Disposable,
  WidgetDependenciesConstraint,
  WidgetFaultConstraint,
  WidgetGenericFault,
} from "../../public-types.js";
import { tryExecute, type UnexpectedFault } from "../../tryExecute.js";
import type { Values } from "../../Values.js";
import type { FetchMessage } from "../getFetchMessage.js";
import { importWidgetModuleFromNamespace, type WidgetModuleNamespace } from "../importWidgetModuleFromNamespace.js";
import { subscribeToErrors } from "./subscribeToErrors.js";

export const IFrameImportFaultTypes = {
  Attach: "iframe-initialization-failed",
  InvalidArguments: "iframe-invalid-arguments",
  NoExport: "iframe-no-export",
  Timeout: "iframe-timeout",
} as const;

type ImportWidgetModuleViaIFrameFaultType = Values<typeof IFrameImportFaultTypes>;
type ImportWidgetModuleViaIFramePrivateFaults = WidgetGenericFault<ImportWidgetModuleViaIFrameFaultType>;

const createImportFailure = (
  type: ImportWidgetModuleViaIFrameFaultType,
  message: string
): OperationFailed<ImportWidgetModuleViaIFramePrivateFaults> => createFailure({ type, message });

export type AddImportWidgetModuleViaIFrameFaults<
  TFault extends WidgetFaultConstraint,
  TConfigureWindowFaults extends WidgetFaultConstraint,
> =
  | TFault
  | TConfigureWindowFaults
  | UnexpectedFault
  | ImportWidgetModuleViaIFramePrivateFaults
  | {
      readonly type: "iframe-module-load-failed";
      readonly message: string;
      readonly error: unknown;
      readonly fetchMessage: FetchMessage;
    }
  | {
      readonly type: "iframe-on-error-handler";
      readonly message: string;
      readonly error: unknown;
    };

type ConfigureContentWindow<TFault extends WidgetFaultConstraint, TDisposeFault extends WidgetFaultConstraint> = (
  win: Window
) => Promise<OperationResult<TFault, Disposable<TDisposeFault>>>;

const eventName = "pass-dynamic-import";
const iframeInlineScript = `dispatchEvent(new CustomEvent("${eventName}",{detail:url=>import(url)}));`;
export const iframeInlineScriptCspHash = "'sha256-vifhlzy17LwseaW8RvOKbXPC0/2yFPJFmXrd7MxIZeM='";

async function* importInternal<
  TDependencies extends WidgetDependenciesConstraint,
  TImportModuleFault extends WidgetFaultConstraint,
  TConfigureWindowFaults extends WidgetFaultConstraint,
  TConfigureWindowDisposeFaults extends WidgetFaultConstraint,
  TApi,
>(
  dependencies: TDependencies,
  widgetUrl: string,
  document: Document,
  configureContentWindow: ConfigureContentWindow<TConfigureWindowFaults, TConfigureWindowDisposeFaults>
): AsyncGenerator<
  () => Promise<OperationResult<TConfigureWindowDisposeFaults, void>>,
  OperationResult<AddImportWidgetModuleViaIFrameFaults<TImportModuleFault, TConfigureWindowFaults>, TApi>,
  void
> {
  const iframe = document.createElement("iframe");
  iframe.src = "about:blank";
  await new Promise((resolve) => {
    iframe.onload = resolve;
    document.head.appendChild(iframe);
  });

  yield async () => {
    document.head.removeChild(iframe);
    return createSuccess(undefined);
  };

  const { contentWindow } = iframe;
  if (!contentWindow) {
    return createImportFailure(IFrameImportFaultTypes.Attach, "Iframe has no window available");
  }

  const unhandledErrorAbortController = new AbortController();
  const unhandledErrorPromise = new Promise<
    OperationFailed<AddImportWidgetModuleViaIFrameFaults<TImportModuleFault, TConfigureWindowFaults>>
  >((resolve) =>
    subscribeToErrors(
      contentWindow,
      (message, error) => resolve(createFailure({ type: "iframe-on-error-handler", message, error })),
      { once: true, passive: true, signal: unhandledErrorAbortController.signal }
    )
  );
  yield async () => {
    unhandledErrorAbortController.abort();
    return createSuccess(undefined);
  };

  const configurationOperationResult = await Promise.race([
    unhandledErrorPromise,
    tryExecute(() => configureContentWindow(contentWindow)),
  ]);
  if (isSuccess(configurationOperationResult)) {
    const configurationResult = configurationOperationResult.value;
    yield () => configurationResult.dispose();
  } else {
    return configurationOperationResult;
  }

  const timeoutAbortController = new AbortController();
  const timeoutPromise = new Promise<OperationFailed<ImportWidgetModuleViaIFramePrivateFaults>>((resolve) => {
    const timeout = setTimeout(
      () => resolve(createImportFailure(IFrameImportFaultTypes.Timeout, "Iframe inline script initialization timeout")),
      30 * 1000
    );
    timeoutAbortController.signal.addEventListener("abort", () => clearTimeout(timeout));
  });

  type ImportFunction = (url: string) => Promise<WidgetModuleNamespace<TDependencies, TImportModuleFault, TApi>>;
  const importFunctionAbortController = new AbortController();
  const importFunctionPromise = new Promise<OperationSuccess<ImportFunction>>((resolve) => {
    contentWindow.addEventListener(
      eventName,
      (e) => resolve(createSuccess((e as CustomEvent<ImportFunction>).detail)),
      { once: true, passive: true, signal: importFunctionAbortController.signal }
    );
  });

  const script = contentWindow.document.createElement("script");
  script.type = "module";
  script.text = iframeInlineScript;
  contentWindow.document.head.appendChild(script);
  contentWindow.document.head.removeChild(script);

  const importFunctionResult = await tryExecute(() =>
    Promise.race([unhandledErrorPromise, importFunctionPromise, timeoutPromise])
  );
  timeoutAbortController.abort();
  importFunctionAbortController.abort();
  if (isFailure(importFunctionResult)) {
    return importFunctionResult;
  }

  const namespaceImportResult = await tryExecuteSimple(() => importFunctionResult.value(widgetUrl));

  async function importNamespace(): Promise<
    OperationResult<AddImportWidgetModuleViaIFrameFaults<TImportModuleFault, never>, TApi>
  > {
    const moduleImportResult = await importWidgetModuleFromNamespace<TDependencies, TImportModuleFault, TApi>(
      namespaceImportResult,
      widgetUrl,
      dependencies
    );
    if (isSuccess(moduleImportResult)) {
      return moduleImportResult;
    }

    const { fault } = moduleImportResult;
    switch (fault.type) {
      case "namespace-module-load-failed":
        return createFailure({
          type: "iframe-module-load-failed",
          message: fault.message,
          error: fault.error,
          fetchMessage: fault.fetchMessage,
        });
      case "namespace-no-export":
        return createImportFailure(IFrameImportFaultTypes.NoExport, fault.message);
      case "passthrough":
        return createFailure(fault.inner);
    }
  }

  const result = await Promise.race([unhandledErrorPromise, importNamespace()]);
  unhandledErrorAbortController.abort();
  return result;
}

export type AddImportWidgetModuleViaIFrameDisposeFaults<
  TModuleDisposeFault extends WidgetFaultConstraint,
  TConfigureWindowDisposeFaults extends WidgetFaultConstraint,
> = AggregateFaultsResult<UnexpectedFault | TConfigureWindowDisposeFaults> | TModuleDisposeFault;

type Params<
  TDependencies extends WidgetDependenciesConstraint,
  TConfigureWindowFaults extends WidgetFaultConstraint,
  TConfigureWindowDisposeFaults extends WidgetFaultConstraint,
> = {
  readonly dependencies: TDependencies;
  readonly widgetUrl: URL;
  readonly document: Document;
  readonly configureContentWindow: ConfigureContentWindow<TConfigureWindowFaults, TConfigureWindowDisposeFaults>;
};

type ExtractDisposableFault<TModule extends Disposable<WidgetFaultConstraint>> =
  TModule extends Disposable<infer TFault> ? TFault : never;

async function recordRollbacks<TRollback, TResult>(
  generator: AsyncGenerator<TRollback, TResult, void>,
  recordRollback: (rollback: TRollback) => void
): Promise<TResult> {
  while (true) {
    const iterationResult = await generator.next();
    if (iterationResult.done) {
      return iterationResult.value;
    } else {
      recordRollback(iterationResult.value);
    }
  }
}

export async function importWidgetModuleViaIframe<
  TDependencies extends WidgetDependenciesConstraint,
  TImportModuleFault extends WidgetFaultConstraint,
  TConfigureWindowFaults extends WidgetFaultConstraint,
  TConfigureWindowDisposeFaults extends WidgetFaultConstraint,
  TApi extends Disposable<ExtractDisposableFault<TApi>>,
>({
  dependencies,
  widgetUrl,
  document,
  configureContentWindow,
}: Params<TDependencies, TConfigureWindowFaults, TConfigureWindowDisposeFaults>): Promise<
  OperationResult<
    AddImportWidgetModuleViaIFrameFaults<TImportModuleFault, TConfigureWindowFaults>,
    Omit<TApi, "dispose"> &
      Disposable<
        AddImportWidgetModuleViaIFrameDisposeFaults<ExtractDisposableFault<TApi>, TConfigureWindowDisposeFaults>
      >
  >
> {
  if (!widgetUrl) {
    return createImportFailure(IFrameImportFaultTypes.InvalidArguments, `Widget url '${widgetUrl}' is invalid`);
  }

  if (!dependencies) {
    return createImportFailure(IFrameImportFaultTypes.InvalidArguments, `Dependencies '${dependencies}' are invalid`);
  }

  if (!document) {
    return createImportFailure(
      IFrameImportFaultTypes.InvalidArguments,
      `Document '${document}' to attach iframe is invalid`
    );
  }

  const { token, cancel } = new AsyncCancellationTokenSource<
    OperationResult<UnexpectedFault | TConfigureWindowDisposeFaults, void>
  >();

  const importResult = await recordRollbacks<
    () => Promise<OperationResult<TConfigureWindowDisposeFaults, void>>,
    OperationResult<AddImportWidgetModuleViaIFrameFaults<TImportModuleFault, TConfigureWindowFaults>, TApi>
  >(importInternal(dependencies, widgetUrl.href, document, configureContentWindow), (rollback) =>
    token.register(() => tryExecute(rollback))
  );

  if (isFailure(importResult)) {
    await cancel();
    return importResult;
  }

  const { dispose, ...rest } = importResult.value;
  return createSuccess({
    ...rest,
    dispose: callDisposeOnce<
      AddImportWidgetModuleViaIFrameDisposeFaults<ExtractDisposableFault<TApi>, TConfigureWindowDisposeFaults>
    >(async () => {
      const disposeResult = await tryExecute(dispose);
      const cancelResult = await cancel();

      return isFailure(disposeResult) ? disposeResult : aggregateFaults(cancelResult, ({ message }) => message);
    }),
  });
}
