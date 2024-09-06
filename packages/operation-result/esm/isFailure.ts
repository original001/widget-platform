import { isSuccess } from "./isSuccess.js";
import type { OperationFailed, OperationResult } from "./OperationResult.js";

export function isFailure<TFault, TValue>(
  operationResult: OperationResult<TFault, TValue>
): operationResult is OperationFailed<TFault> {
  return !isSuccess(operationResult);
}
