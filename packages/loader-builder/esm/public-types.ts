import type { OperationResult } from "@skbkontur/operation-result";

export type WidgetDependenciesConstraint = {
  readonly [key: string]: unknown;
};

export type WidgetGenericFault<TType extends string> = {
  readonly type: TType;
  readonly message: string;
};

export type WidgetFaultConstraint = WidgetGenericFault<string>;

export type CreateWidgetApi<
  TDependencies extends WidgetDependenciesConstraint,
  TFault extends WidgetFaultConstraint,
  TWidgetApi,
> = (param: { readonly dependencies: TDependencies }) => Promise<OperationResult<TFault, TWidgetApi>>;

export type Disposable<TDisposeFault extends WidgetFaultConstraint> = {
  readonly dispose: () => Promise<OperationResult<TDisposeFault, void>>;
};
