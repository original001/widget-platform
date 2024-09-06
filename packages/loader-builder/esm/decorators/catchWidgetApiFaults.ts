import { createSuccess, isFailure } from "@skbkontur/operation-result";
import type { WidgetFaultConstraint } from "../public-types.js";
import { tryExecute, type UnexpectedFault } from "../tryExecute.js";
import type { DefaultWidgetApi, InitWidget, WidgetInitResult } from "./widgetApiTypes.js";

export type AddCatchWidgetApiDisposeFaults<TFault extends WidgetFaultConstraint> = TFault | UnexpectedFault;
export type AddCatchWidgetApiInitFaults<TFault extends WidgetFaultConstraint> = TFault | UnexpectedFault;
export type AddCatchWidgetApiInitDisposeFaults<TFault extends WidgetFaultConstraint> = TFault | UnexpectedFault;

export function catchWidgetApiFaults<
  TApiDisposeFault extends WidgetFaultConstraint,
  TInitParams,
  TtInitFault extends WidgetFaultConstraint,
  TInitDisposeFault extends WidgetFaultConstraint,
>(
  widgetApi: DefaultWidgetApi<
    TApiDisposeFault,
    InitWidget<TInitParams, TtInitFault, WidgetInitResult<TInitDisposeFault>>
  >
): DefaultWidgetApi<
  AddCatchWidgetApiDisposeFaults<TApiDisposeFault>,
  InitWidget<
    TInitParams,
    AddCatchWidgetApiInitFaults<TtInitFault>,
    WidgetInitResult<AddCatchWidgetApiInitDisposeFaults<TInitDisposeFault>>
  >
> {
  return {
    init: (params) =>
      tryExecute(async () => {
        const initializationResult = await widgetApi.init(params);
        return isFailure(initializationResult)
          ? initializationResult
          : createSuccess({
              dispose: () => tryExecute(initializationResult.value.dispose),
            });
      }),
    dispose: () => tryExecute(widgetApi.dispose),
  };
}
