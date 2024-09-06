import type { Disposable, WidgetFaultConstraint } from "@skbkontur/loader-builder";
import { createFailure, createSuccess, isFailure, type OperationResult } from "@skbkontur/operation-result";
import { type RenderWidget, usePersistentCallback } from "@skbkontur/widget-consumer-react-utils";
import { dispose, type FaultProcessor } from "./dispose.js";
import type { ShowLoader } from "./useGlobalLoader.js";

type Options<TDisposeFault> = {
  readonly processDisposeFault: FaultProcessor<TDisposeFault>;
  readonly showLoader: ShowLoader;
};

export function useWidgetRenderCallback<TRenderFault, TDisposeFault extends WidgetFaultConstraint>(
  renderWidget: (container: HTMLElement) => Promise<OperationResult<TRenderFault, Disposable<TDisposeFault>>>,
  dependencies: readonly unknown[],
  { processDisposeFault, showLoader }: Options<TDisposeFault>
): RenderWidget<TRenderFault> {
  return usePersistentCallback(
    async (container: HTMLElement) => {
      const hideLoader = showLoader();
      try {
        const renderResult = await renderWidget(container);
        return isFailure(renderResult)
          ? createFailure(renderResult.fault)
          : createSuccess({
              dispose: () => dispose(showLoader, renderResult.value, processDisposeFault),
            });
      } finally {
        hideLoader();
      }
    },
    [showLoader, processDisposeFault, ...dependencies]
  );
}
