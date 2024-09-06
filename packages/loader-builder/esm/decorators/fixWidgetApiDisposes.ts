import { createFailure, createSuccess, isFailure, isSuccess, type OperationResult } from "@skbkontur/operation-result";
import { aggregateFaults, type AggregateFaultsResult } from "../aggregateFaults.js";
import { AsyncCancellationTokenSource } from "../AsyncCancellationTokenSource.js";
import type { WidgetFaultConstraint, WidgetGenericFault } from "../public-types.js";
import type { Values } from "../Values.js";
import { callDisposeOnce } from "./callDisposeOnce.js";
import type { DefaultWidgetApi, InitWidget, WidgetInitResult } from "./widgetApiTypes.js";

export type AddFixWidgetApiDisposesFaults<
  TApiDisposeFaults extends WidgetFaultConstraint,
  TApiInitDisposeFaults extends WidgetFaultConstraint,
> = TApiDisposeFaults | AggregateFaultsResult<TApiInitDisposeFaults>;

export const FixWidgetApiDisposesInitFaultTypes = {
  WidgetApiDisposed: "widget-api-disposed",
} as const;

export type AddFixWidgetApiDisposesInitFaults<TInitFault extends WidgetFaultConstraint> =
  | WidgetGenericFault<Values<typeof FixWidgetApiDisposesInitFaultTypes>>
  | TInitFault;

type InitWidgetFixDisposes<
  TInitParams,
  TInitFaults extends WidgetFaultConstraint,
  TInitDisposeFaults extends WidgetFaultConstraint,
> = InitWidget<TInitParams, AddFixWidgetApiDisposesInitFaults<TInitFaults>, WidgetInitResult<TInitDisposeFaults>>;

function limitToOneInitializationResultDisposeCalls<
  TApiDisposeFaults extends WidgetFaultConstraint,
  TInitParams,
  TInitFaults extends WidgetFaultConstraint,
  TInitDisposeFaults extends WidgetFaultConstraint,
>({
  dispose,
  init,
}: DefaultWidgetApi<
  TApiDisposeFaults,
  InitWidget<TInitParams, TInitFaults, WidgetInitResult<TInitDisposeFaults>>
>): DefaultWidgetApi<TApiDisposeFaults, InitWidget<TInitParams, TInitFaults, WidgetInitResult<TInitDisposeFaults>>> {
  return {
    dispose,
    init: async (params) => {
      const initializationResult = await init(params);
      if (isFailure(initializationResult)) {
        return initializationResult;
      }

      return createSuccess({
        dispose: callDisposeOnce(initializationResult.value.dispose),
      });
    },
  };
}

function disallowModuleUseAfterModuleDispose<
  TApiDisposeFaults extends WidgetFaultConstraint,
  TInitParams,
  TInitFaults extends WidgetFaultConstraint,
  TInitDisposeFaults extends WidgetFaultConstraint,
>(
  widgetApi: DefaultWidgetApi<
    TApiDisposeFaults,
    InitWidget<TInitParams, TInitFaults, WidgetInitResult<TInitDisposeFaults>>
  >
): DefaultWidgetApi<TApiDisposeFaults, InitWidgetFixDisposes<TInitParams, TInitFaults, TInitDisposeFaults>> {
  let init: InitWidgetFixDisposes<TInitParams, TInitFaults, TInitDisposeFaults> = widgetApi.init;

  const dispose = async () => {
    init = async () =>
      createFailure({
        type: FixWidgetApiDisposesInitFaultTypes.WidgetApiDisposed,
        message: "Widget module is disposed. To init new widget your should get new module.",
      });

    return await widgetApi.dispose();
  };

  return {
    dispose: callDisposeOnce(() => dispose()),
    init: (params) => init(params),
  };
}

function disposeInitializationResultsOnModuleDispose<
  TApiDisposeFaults extends WidgetFaultConstraint,
  TInitParams,
  TInitFaults extends WidgetFaultConstraint,
  TInitDisposeFaults extends WidgetFaultConstraint,
>({
  dispose,
  init,
}: DefaultWidgetApi<
  TApiDisposeFaults,
  InitWidget<TInitParams, TInitFaults, WidgetInitResult<TInitDisposeFaults>>
>): DefaultWidgetApi<
  AddFixWidgetApiDisposesFaults<TApiDisposeFaults, TInitDisposeFaults>,
  InitWidget<TInitParams, TInitFaults, WidgetInitResult<TInitDisposeFaults>>
> {
  const cancellationTokenSource = new AsyncCancellationTokenSource<OperationResult<TInitDisposeFaults, void>>();
  const { token, cancel } = cancellationTokenSource;

  return {
    init: async (params: TInitParams) => {
      const initPromise = init(params);
      token.register(async () => {
        const initResult = await initPromise;
        return isSuccess(initResult) ? await initResult.value.dispose() : createSuccess(undefined);
      });

      return await initPromise;
    },
    dispose: async () => {
      const cancelResults = await cancel();
      const disposeResult = await dispose();

      const initsDisposesFault = aggregateFaults(cancelResults, ({ message }) => message);
      return isFailure(initsDisposesFault) ? initsDisposesFault : disposeResult;
    },
  };
}

export function fixWidgetApiDisposes<
  TApiDisposeFaults extends WidgetFaultConstraint,
  TInitParams,
  TInitFaults extends WidgetFaultConstraint,
  TInitDisposeFaults extends WidgetFaultConstraint,
>(
  widgetApi: DefaultWidgetApi<
    TApiDisposeFaults,
    InitWidget<TInitParams, TInitFaults, WidgetInitResult<TInitDisposeFaults>>
  >
): DefaultWidgetApi<
  AddFixWidgetApiDisposesFaults<TApiDisposeFaults, TInitDisposeFaults>,
  InitWidgetFixDisposes<TInitParams, TInitFaults, TInitDisposeFaults>
> {
  return disallowModuleUseAfterModuleDispose(
    disposeInitializationResultsOnModuleDispose(limitToOneInitializationResultDisposeCalls(widgetApi))
  );
}
