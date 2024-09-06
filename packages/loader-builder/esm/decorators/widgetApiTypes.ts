import type { OperationResult } from "@skbkontur/operation-result";
import type { Disposable, WidgetFaultConstraint } from "../public-types.js";

export type WidgetInitResult<TDisposeFault extends WidgetFaultConstraint> = Disposable<TDisposeFault>;

export type InitWidget<
  TParams,
  TFault extends WidgetFaultConstraint,
  TResult extends WidgetInitResult<WidgetFaultConstraint>,
> = (params: TParams) => Promise<OperationResult<TFault, TResult>>;

export type DefaultWidgetApi<
  TDisposeFault extends WidgetFaultConstraint,
  TInit extends InitWidget<never, WidgetFaultConstraint, WidgetInitResult<WidgetFaultConstraint>>,
> = {
  readonly init: TInit;
} & Disposable<TDisposeFault>;
