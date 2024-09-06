import { createFailure, createSuccess, isFailure, type OperationResult } from "@skbkontur/operation-result";
import type { WidgetFaultConstraint } from "./public-types.js";

export type AggregateFault<TFault extends WidgetFaultConstraint> = {
  readonly type: "aggregate";
  readonly message: string;
  readonly faults: readonly TFault[];
};

export type AggregateFaultsResult<TFault extends WidgetFaultConstraint> = TFault | AggregateFault<TFault>;

function any<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

export function aggregateFaults<TFault extends WidgetFaultConstraint>(
  results: readonly OperationResult<TFault, unknown>[],
  toString: (fault: TFault) => string
): OperationResult<AggregateFaultsResult<TFault>, void> {
  const faults = results.filter(isFailure).map((result) => result.fault);
  if (any(faults)) {
    const [first, ...other] = faults;
    return any(other)
      ? createFailure({
          type: "aggregate",
          faults,
          message: toString(first),
        })
      : createFailure(first);
  }

  return createSuccess(undefined);
}
