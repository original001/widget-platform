import type { OperationFailed } from "./OperationResult.js";

export function createFailure<TFault>(fault: TFault): OperationFailed<TFault> {
  return { success: false, fault };
}
