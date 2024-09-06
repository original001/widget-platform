import { createSuccess, type OperationResult } from "@skbkontur/operation-result";

export function callDisposeOnce<TDisposeFault>(
  dispose: () => Promise<OperationResult<TDisposeFault, void>>
): () => Promise<OperationResult<TDisposeFault, void>> {
  let disposeOnce = async () => {
    disposeOnce = async () => createSuccess(undefined);
    return dispose();
  };

  return () => disposeOnce();
}
