import { createFailure } from "./createFailure.js";
import { createSuccess } from "./createSuccess.js";
import type { OperationResult } from "./OperationResult.js";

export async function tryExecute<TValue>(func: () => Promise<TValue>): Promise<OperationResult<unknown, TValue>> {
  try {
    return createSuccess(await func());
  } catch (error) {
    return createFailure(error);
  }
}
