import { ensureSuccess } from "./ensureSuccess.js";
import type { OperationResult } from "./OperationResult.js";

export function getValueOrThrow<TValue>(operationResult: OperationResult<unknown, TValue>): TValue {
  ensureSuccess(operationResult);
  return operationResult.value;
}
