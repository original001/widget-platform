import type { Disposable, WidgetFaultConstraint } from "@skbkontur/loader-builder";
import { isSuccess, type OperationResult } from "@skbkontur/operation-result";
import { executeAbortable } from "@skbkontur/widget-consumer-react-utils";
import { useEffect, useState } from "react";
import { dispose, type FaultProcessor } from "./dispose.js";
import type { ShowLoader } from "./useGlobalLoader.js";

const loadingState = { type: "loading" } as const;

type State<TFault, TWidgetApi> =
  | typeof loadingState
  | {
      readonly type: "fault";
      readonly fault: TFault;
    }
  | {
      readonly type: "success";
      readonly widgetApi: TWidgetApi;
    };

type Options<TDisposeFault> = {
  readonly processDisposeFault: FaultProcessor<TDisposeFault>;
  readonly showLoader: ShowLoader;
};
export function useWidgetApi<
  TImportFault,
  TDisposeFault extends WidgetFaultConstraint,
  TWidgetApi extends Disposable<TDisposeFault>,
>(
  getWidgetApi: () => Promise<OperationResult<TImportFault, TWidgetApi>>,
  { processDisposeFault, showLoader }: Options<TDisposeFault>
): State<TImportFault, TWidgetApi> {
  const [state, setState] = useState<State<TImportFault, TWidgetApi>>(loadingState);

  useEffect(() => {
    const abortController = new AbortController();

    executeAbortable(
      abortController.signal,
      (async function* () {
        setState(loadingState);
        const hideLoader = showLoader();

        try {
          const result = await getWidgetApi();
          if (isSuccess(result)) {
            yield () => dispose(showLoader, result.value, processDisposeFault);
            setState({ type: "success", widgetApi: result.value });
          } else {
            yield;
            setState({ type: "fault", fault: result.fault });
          }
        } catch (error) {
          yield;
          setState(() => {
            throw error;
          });
        } finally {
          hideLoader();
        }
      })()
    );
    return () => abortController.abort();
  }, [getWidgetApi, processDisposeFault, showLoader, setState]);

  return state;
}
