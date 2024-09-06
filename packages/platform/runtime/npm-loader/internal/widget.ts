import type {
  CreateWidgetApi as CreateWidgetApiInternal,
  Disposable,
  WidgetDependenciesConstraint,
  WidgetFaultConstraint,
  WidgetGenericFault,
} from "@skbkontur/loader-builder";
import type { OperationResult } from "@skbkontur/operation-result";

export type AddStyleRootFault = WidgetGenericFault<"style-manager">;
export type StyleManager = (
  styleRoot: Document | ShadowRoot
) => Promise<OperationResult<AddStyleRootFault, Disposable<never>>>;

type WidgetFrameworkDependencies = {
  readonly addStyleRoot: StyleManager;
};

export type CreateWidgetApi<
  TDependencies extends WidgetDependenciesConstraint,
  TFault extends WidgetFaultConstraint,
  TWidgetApi extends Disposable<WidgetFaultConstraint>,
> = CreateWidgetApiInternal<TDependencies & WidgetFrameworkDependencies, TFault, TWidgetApi>;
