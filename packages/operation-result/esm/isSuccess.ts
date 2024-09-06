import type { OperationResult, OperationSuccess } from "./OperationResult.js";

export function isSuccess<TFault, TValue>(
  operationResult: OperationResult<TFault, TValue>
): operationResult is OperationSuccess<TValue> {
  return operationResult.success;
}
