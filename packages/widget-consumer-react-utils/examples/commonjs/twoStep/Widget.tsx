import type { WidgetFaultConstraint } from "@skbkontur/loader-builder";
import { createFailure, createSuccess, isFailure, type OperationFailed } from "@skbkontur/operation-result";
import { usePersistentCallback, WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import type { JSX } from "react";

type Props = {
  readonly account: string;
  readonly message: string;
};

function logFault(result: OperationFailed<WidgetFaultConstraint>) {
  console.error(result.fault.message);
}

export function Widget({ account, message }: Props): JSX.Element {
  const renderWidget = usePersistentCallback(
    async (container: HTMLElement) => {
      const { getModule } = await import("./api.mjs");
      const moduleResult = await getModule(account);
      if (isFailure(moduleResult)) {
        logFault(moduleResult);
        return createFailure(undefined);
      }

      const renderResult = await moduleResult.value.render({ container, message });
      if (isFailure(renderResult)) {
        logFault(renderResult);
        return createFailure(undefined);
      }

      return createSuccess({
        async dispose() {
          const renderDisposeResult = await renderResult.value.dispose();
          if (isFailure(renderDisposeResult)) {
            logFault(renderDisposeResult);
          }

          const moduleResultDisposeResult = await moduleResult.value.dispose();
          if (isFailure(moduleResultDisposeResult)) {
            logFault(moduleResultDisposeResult);
          }
        },
      });
    },
    [account, message]
  );

  return (
    <WidgetRenderer
      loader={<>Загрузка</>}
      renderWidget={renderWidget}
      renderFault={({ retryRender }) => <button onClick={retryRender}>Повторить</button>}
    />
  );
}
