import type { OperationSuccess } from "./OperationResult.js";

export function createSuccess<TValue>(value: TValue): OperationSuccess<TValue> {
  return { success: true, value };
}
