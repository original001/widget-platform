import { createSuccess, isFailure, type OperationResult } from "@skbkontur/operation-result";
import type { WidgetFaultConstraint } from "../public-types.js";
import { tryExecute } from "../tryExecute.js";
import { callDisposeOnce } from "./callDisposeOnce.js";
import type { AddCatchWidgetApiInitDisposeFaults, AddCatchWidgetApiInitFaults } from "./catchWidgetApiFaults.js";
import type { InitWidget, WidgetInitResult } from "./widgetApiTypes.js";

export type RenderFunction<
  TParams,
  TFault extends WidgetFaultConstraint = never,
  TDisposeFault extends WidgetFaultConstraint = never,
> = InitWidget<
  TParams,
  AddCatchWidgetApiInitFaults<TFault>,
  WidgetInitResult<AddCatchWidgetApiInitDisposeFaults<TDisposeFault>>
>;

export function createRenderer<
  TParams,
  TFault extends WidgetFaultConstraint,
  TDisposeFault extends WidgetFaultConstraint,
>(
  renderFn: (params: TParams) => Promise<OperationResult<TFault, () => Promise<OperationResult<TDisposeFault, void>>>>
): RenderFunction<TParams, TFault, TDisposeFault> {
  return async (params: TParams) => {
    const result = await tryExecute(() => renderFn(params));

    if (isFailure(result)) {
      return result;
    }

    const tryDispose = () => tryExecute(result.value);
    return createSuccess({
      dispose: callDisposeOnce(tryDispose),
    });
  };
}
