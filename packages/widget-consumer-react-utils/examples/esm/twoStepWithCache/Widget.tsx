import type { WidgetFaultConstraint } from "@skbkontur/loader-builder";
import { createFailure, createSuccess, isFailure } from "@skbkontur/operation-result";
import type { OperationFailed, OperationResult } from "@skbkontur/operation-result";
import { usePersistentCallback, WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import type { JSX } from "react";
import { Fault, FaultType, importWidgetModule, type WidgetApi } from "../../__mocks__/twoStepNpmLoader.js";

type Props = {
  readonly faultType: FaultType;
  readonly account: string;
  readonly message: string;
};

function logFault(result: OperationFailed<WidgetFaultConstraint>) {
  console.error(result.fault.message);
}

// Плохой способ кеширования (гонки, глобальное состояние, никогда не вызывается dispose)
// Лучший способ кеширования может быть реализован в вашем приложении с помощью React.Context или mobx.
let cache: OperationResult<Fault, WidgetApi> = createFailure({ type: "unexpected", message: "not loaded yet" });

export function Widget({ faultType, account, message }: Props): JSX.Element {
  const renderWidget = usePersistentCallback(
    async (container: HTMLElement) => {
      if (isFailure(cache)) {
        cache = await importWidgetModule({
          widgetUrl: new URL(window.location.href),
          faultType,
          account,
        });
      }

      if (isFailure(cache)) {
        logFault(cache);
        return createFailure(undefined);
      }

      const renderResult = await cache.value.render({ container, message });
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
        },
      });
    },
    [message]
  );

  return (
    <WidgetRenderer
      loader={<>Загрузка</>}
      renderWidget={renderWidget}
      renderFault={({ retryRender }) => <button onClick={retryRender}>Повторить</button>}
    />
  );
}
