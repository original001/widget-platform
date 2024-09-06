import {
  createFailure,
  isSuccess,
  type OperationResult,
  tryExecute as tryExecuteSimple,
} from "@skbkontur/operation-result";
import type { WidgetFaultConstraint } from "./public-types.js";

function getErrorMessage(error: any): string {
  if (!error) {
    return String(error);
  }

  const { name, message, cause } = error;
  const caused = cause ? `; caused by ${getErrorMessage(cause)}` : "";
  if (message) {
    return `${name}: ${message}${caused}`;
  }

  return error.toString();
}

export const UnexpectedFaultType = "unexpected";

export type UnexpectedFault = {
  readonly type: typeof UnexpectedFaultType;
  readonly message: string;
  readonly error: unknown;
};

export async function tryExecute<TFault extends WidgetFaultConstraint, TValue>(
  func: () => Promise<OperationResult<TFault, TValue>>
): Promise<OperationResult<TFault | UnexpectedFault, TValue>> {
  const result = await tryExecuteSimple(func);
  return isSuccess(result)
    ? result.value
    : createFailure({
        type: UnexpectedFaultType,
        message: getErrorMessage(result.fault),
        error: result.fault,
      });
}
