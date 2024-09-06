import { createFailure, createSuccess } from "@skbkontur/operation-result";
import { usePersistentCallback, WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import type { JSX } from "react";
import { ErrorBoundary } from "react-error-boundary";

type Props = {
  readonly account: string;
};

export function Widget({ account }: Props): JSX.Element {
  const renderWidget = usePersistentCallback(
    async (container: HTMLElement) => {
      // Ловить ошибку импорта бесполезно, так как нельзя повторить попытку загрузив модуль еще раз в webpack.
      // При ошибке импорта нужно перезагружать всю станицу в ErrorBoundary
      const { mount } = await import("./remote-example.js");

      try {
        const unmount = mount({ account, container });
        return createSuccess({
          async dispose() {
            try {
              unmount();
            } catch (error) {
              console.error(error);
            }
          },
        });
      } catch (error) {
        console.error(error);
        return createFailure(undefined);
      }
    },
    [account]
  );

  return (
    <ErrorBoundary
      fallbackRender={() => <button onClick={window.location.reload}>Повторить перезагрузив страницу</button>}
    >
      <WidgetRenderer
        loader={<>Загрузка</>}
        renderWidget={renderWidget}
        renderFault={({ retryRender }) => <button onClick={retryRender}>Повторить рендер</button>}
      />
    </ErrorBoundary>
  );
}
