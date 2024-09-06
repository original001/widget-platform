import type { OperationFailed, OperationResult } from "@skbkontur/operation-result";
import { createFailure, isFailure, isSuccess } from "@skbkontur/operation-result";
import { createWidgetApiExportName } from "../createWidgetApiExportName.js";
import type {
  CreateWidgetApi,
  WidgetDependenciesConstraint,
  WidgetFaultConstraint,
  WidgetGenericFault,
} from "../public-types.js";
import { tryExecute, type UnexpectedFault } from "../tryExecute.js";
import { type FetchMessage, getFetchMessage } from "./getFetchMessage.js";

type NoExportFault = WidgetGenericFault<"namespace-no-export">;

const createNoExportFailure = (message: string): OperationFailed<NoExportFault> =>
  createFailure({
    type: "namespace-no-export",
    message,
  });

type ImportWidgetModuleFromNamespaceFaults<TFault> =
  | NoExportFault
  | {
      readonly type: "namespace-module-load-failed";
      readonly message: string;
      readonly error: unknown;
      readonly fetchMessage: FetchMessage;
    }
  | {
      readonly type: "passthrough";
      readonly inner: TFault | UnexpectedFault;
    };

export type WidgetModuleNamespace<
  TDependencies extends WidgetDependenciesConstraint,
  TImportFault extends WidgetFaultConstraint,
  TApi,
> = {
  readonly [createWidgetApiExportName]: CreateWidgetApi<TDependencies, TImportFault, TApi>;
};

export async function importWidgetModuleFromNamespace<
  TDependencies extends WidgetDependenciesConstraint,
  TImportFault extends WidgetFaultConstraint,
  TApi,
>(
  importNamespaceResult: OperationResult<unknown, WidgetModuleNamespace<TDependencies, TImportFault, TApi>>,
  widgetUrl: string,
  dependencies: TDependencies
): Promise<OperationResult<ImportWidgetModuleFromNamespaceFaults<TImportFault>, TApi>> {
  if (isFailure(importNamespaceResult)) {
    return createFailure({
      type: "namespace-module-load-failed",
      message: `Failed to load module '${widgetUrl}'`,
      error: importNamespaceResult.fault,
      fetchMessage: await getFetchMessage(widgetUrl),
    });
  }

  const { value } = importNamespaceResult;
  if (!value) {
    return createNoExportFailure(`Module '${widgetUrl}' has no namespace`);
  }

  const createWidgetApi = value[createWidgetApiExportName];
  if (!createWidgetApi) {
    return createNoExportFailure(
      `Namespace '${JSON.stringify(value)}' doesn't have '${createWidgetApiExportName}' export`
    );
  }

  if (typeof createWidgetApi !== "function") {
    return createNoExportFailure(`Export '${createWidgetApiExportName}' is not a function: '${createWidgetApi}'`);
  }

  const createWidgetApiResult = await tryExecute(() => createWidgetApi({ dependencies }));
  if (isSuccess(createWidgetApiResult)) {
    return createWidgetApiResult;
  }

  return createFailure({
    type: "passthrough",
    inner: createWidgetApiResult.fault,
  });
}
