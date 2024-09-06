import { isFailure } from "./isFailure.js";
import type { OperationResult, OperationSuccess } from "./OperationResult.js";

export function ensureSuccess<TValue>(
  operationResult: OperationResult<unknown, TValue>
): asserts operationResult is OperationSuccess<TValue> {
  if (isFailure(operationResult)) {
    throw operationResult.fault;
  }
}
