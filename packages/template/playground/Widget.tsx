import { Button, Center } from "@skbkontur/react-ui";
import { WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import type { RenderDisposeFault, WidgetApi } from "@skbkontur/widget-platform-template-npm-loader";
import { FaultComponent, type ShowLoader, useWidgetRenderCallback } from "@skbkontur/widget-playground";
import type { JSX } from "react";
import { FormSkeleton } from "./skeleton/Form.js";

type Props = {
  readonly processDisposeFault: (fault: RenderDisposeFault) => void;
  readonly showLoader: ShowLoader;
  readonly widgetApi: WidgetApi;
  readonly message: string;
};

export function Widget({ processDisposeFault, showLoader, widgetApi, message }: Props): JSX.Element {
  const renderWidget = useWidgetRenderCallback((container) => widgetApi.render({ container, message }), [widgetApi], {
    processDisposeFault,
    showLoader,
  });

  return (
    <WidgetRenderer
      loader={
        <Center>
          <FormSkeleton />
        </Center>
      }
      renderWidget={renderWidget}
      renderFault={({ fault, retryRender }) => (
        <Center>
          <FaultComponent fault={fault} />
          <Button onClick={retryRender}>Попробовать еще раз</Button>
        </Center>
      )}
    />
  );
}
