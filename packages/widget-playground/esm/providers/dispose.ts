import type { Disposable, WidgetFaultConstraint } from "@skbkontur/loader-builder";
import { isFailure } from "@skbkontur/operation-result";
import type { ShowLoader } from "./useGlobalLoader.js";

export type FaultProcessor<TFault> = (fault: TFault) => void;

export const dispose = async <TFault extends WidgetFaultConstraint>(
  showLoader: ShowLoader,
  disposable: Disposable<TFault>,
  processFault: FaultProcessor<TFault>
): Promise<void> => {
  const hideLoader = showLoader();
  try {
    const result = await disposable.dispose();
    if (isFailure(result)) {
      processFault(result.fault);
    }
  } finally {
    hideLoader();
  }
};
