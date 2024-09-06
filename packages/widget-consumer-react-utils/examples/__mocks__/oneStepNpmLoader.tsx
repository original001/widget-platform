import type { Disposable, WidgetGenericFault } from "@skbkontur/loader-builder";
import type { OperationFailed, OperationResult } from "@skbkontur/operation-result";
import { createFailure, createSuccess } from "@skbkontur/operation-result";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { delay } from "../../delay.js";

export enum FaultType {
  None = "none",
  Import = "import",
  Dispose = "dispose",
}

export type Dependencies = {
  readonly widgetUrl: URL;
  readonly faultType: FaultType;
  readonly account: string;
  readonly container: HTMLElement;
};

export type Fault = WidgetGenericFault<"unexpected">;
export type WidgetApi = Disposable<Fault>;

const getFailure = (message: string): OperationFailed<Fault> =>
  createFailure({
    type: "unexpected",
    message: message,
  });

export async function importWidgetModule({
  faultType,
  account,
  container,
}: Dependencies): Promise<OperationResult<Fault, WidgetApi>> {
  await delay(2500);
  if (faultType === FaultType.Import) {
    return getFailure("This is import fault");
  }

  const root = createRoot(container);
  root.render(<StrictMode>Account: {account}</StrictMode>);

  return createSuccess({
    async dispose() {
      await delay(2500);
      if (faultType === FaultType.Dispose) {
        return getFailure("This is dispose fault");
      }

      root.unmount();
      return createSuccess(undefined);
    },
  });
}
