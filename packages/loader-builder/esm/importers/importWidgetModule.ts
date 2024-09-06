import { createFailure, isSuccess, tryExecute } from "@skbkontur/operation-result";
import type { OperationFailed, OperationResult } from "@skbkontur/operation-result";
import type { WidgetDependenciesConstraint, WidgetFaultConstraint, WidgetGenericFault } from "../public-types.js";
import type { UnexpectedFault } from "../tryExecute.js";
import type { FetchMessage } from "./getFetchMessage.js";
import { importWidgetModuleFromNamespace } from "./importWidgetModuleFromNamespace.js";

type InvalidArgumentsFault = WidgetGenericFault<"invalid-arguments">;

const createInvalidArgumentsFailure = (message: string): OperationFailed<InvalidArgumentsFault> =>
  createFailure({
    type: "invalid-arguments",
    message,
  });

export type AddImportWidgetModuleFaults<TImportFault extends WidgetFaultConstraint> =
  | TImportFault
  | UnexpectedFault
  | InvalidArgumentsFault
  | WidgetGenericFault<"no-export">
  | {
      readonly type: "module-load-failed";
      readonly message: string;
      readonly error: unknown;
      readonly fetchMessage: FetchMessage;
    };

type Params<TDependencies extends WidgetDependenciesConstraint> = {
  readonly widgetUrl: URL;
  readonly dependencies: TDependencies;
};

export async function importWidgetModule<
  TDependencies extends WidgetDependenciesConstraint,
  TFault extends WidgetFaultConstraint,
  TApi,
>({
  widgetUrl,
  dependencies,
}: Params<TDependencies>): Promise<OperationResult<AddImportWidgetModuleFaults<TFault>, TApi>> {
  if (!widgetUrl) {
    return createInvalidArgumentsFailure(`Widget url '${widgetUrl}' is invalid`);
  }

  if (!dependencies) {
    return createInvalidArgumentsFailure(`Dependencies '${dependencies}' is not an object`);
  }

  const href = widgetUrl.href;
  const importNamespaceResult = await tryExecute(() => import(/* webpackIgnore: true */ /* @vite-ignore */ href));
  const importModuleResult = await importWidgetModuleFromNamespace<TDependencies, TFault, TApi>(
    importNamespaceResult,
    href,
    dependencies
  );
  if (isSuccess(importModuleResult)) {
    return importModuleResult;
  }

  const { fault } = importModuleResult;
  switch (fault.type) {
    case "namespace-no-export":
      return createFailure({ type: "no-export", message: fault.message });
    case "namespace-module-load-failed":
      return createFailure({
        type: "module-load-failed",
        message: fault.message,
        error: fault.error,
        fetchMessage: fault.fetchMessage,
      });
    case "passthrough":
      return createFailure(fault.inner);
  }
}
