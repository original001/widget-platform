import { createSuccess, ensureSuccess, isFailure } from "@skbkontur/operation-result";
import { usePersistentCallback, WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import { FaultComponent } from "@skbkontur/widget-playground";
import { importWidgetModule } from "platform-scripts-npm-loader";
import type { Mode } from "platform-scripts-npm-loader";
import type { JSX } from "react";

type Props = {
  readonly widgetUrl: URL;
  readonly mode: Mode;
};

export function Renderer({ mode, widgetUrl }: Props): JSX.Element {
  const renderWidget = usePersistentCallback(
    async (container: HTMLElement) => {
      const widgetApiResult = await importWidgetModule({
        widgetUrl,
        container,
        mode,
      });
      return isFailure(widgetApiResult)
        ? widgetApiResult
        : createSuccess({
            async dispose() {
              const disposeResult = await widgetApiResult.value.dispose();
              ensureSuccess(disposeResult);
            },
          });
    },
    [mode, widgetUrl]
  );

  return (
    <WidgetRenderer
      renderWidget={renderWidget}
      loader={"Загрузка модуля"}
      renderFault={({ fault }) => <FaultComponent fault={fault} />}
    />
  );
}
