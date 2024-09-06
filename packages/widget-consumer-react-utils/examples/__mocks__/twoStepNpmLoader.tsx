import type { Disposable, WidgetGenericFault } from "@skbkontur/loader-builder";
import type { OperationFailed, OperationResult } from "@skbkontur/operation-result";
import { createFailure, createSuccess } from "@skbkontur/operation-result";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { delay } from "../../delay.js";

export enum FaultType {
  None = "none",
  Import = "import",
  Render = "render",
  DisposeRender = "dispose render",
  DisposeImport = "dispose import",
}

export type Dependencies = {
  readonly widgetUrl: URL;
  readonly faultType: FaultType;
  readonly account: string;
};

export type RenderParams = {
  readonly container: HTMLElement;
  readonly message: string;
};

export type Fault = WidgetGenericFault<"unexpected">;
export type WidgetApi = Disposable<Fault> & {
  readonly render: (params: RenderParams) => Promise<OperationResult<Fault, Disposable<Fault>>>;
};

const getFailure = (message: string): OperationFailed<Fault> =>
  createFailure({
    type: "unexpected",
    message: message,
  });

export async function importWidgetModule({
  faultType,
  account,
}: Dependencies): Promise<OperationResult<Fault, WidgetApi>> {
  await delay(2500);
  if (faultType === FaultType.Import) {
    return getFailure("This is import fault");
  }

  let incarnationNumber = 0;
  return createSuccess({
    async render({ container, message }: RenderParams) {
      await delay(2500);
      if (faultType === FaultType.Render) {
        return getFailure("This is render fault");
      }

      const root = createRoot(container);
      root.render(
        <StrictMode>
          Account: {account}
          <br />
          Message: {message}
          <br />
          Incarnation: {++incarnationNumber}
        </StrictMode>
      );

      return createSuccess({
        async dispose() {
          await delay(2500);
          if (faultType === FaultType.DisposeRender) {
            return getFailure("This is render dispose fault");
          }

          root.unmount();
          return createSuccess(undefined);
        },
      });
    },
    async dispose() {
      await delay(2500);
      return faultType === FaultType.DisposeImport
        ? getFailure("This is import dispose fault")
        : createSuccess(undefined);
    },
  });
}
