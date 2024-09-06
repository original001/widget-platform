import { Button, Center } from "@skbkontur/react-ui";
import { WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import type { JSX } from "react";
import type { Fault, WidgetApi } from "../../../widget-consumer-react-utils/examples/__mocks__/twoStepNpmLoader.js";
import { FaultComponent, type ShowLoader, useWidgetRenderCallback } from "../../esm/index.js";
import { DataTids } from "./DataTids.js";
import { Loader } from "./Loader.js";
import type { ProcessDisposeFault } from "./ProcessDisposeFault.js";

type WidgetProps = {
  readonly processDisposeFault: ProcessDisposeFault<Fault>;
  readonly showLoader: ShowLoader;
  readonly widgetApi: WidgetApi;
  readonly message: string;
};

export function Widget({ processDisposeFault, showLoader, widgetApi, message }: WidgetProps): JSX.Element {
  const renderWidget = useWidgetRenderCallback(
    (container) => widgetApi.render({ container, message }),
    [widgetApi, message],
    { processDisposeFault, showLoader }
  );

  return (
    <div data-tid={DataTids.WidgetContainer}>
      <WidgetRenderer
        loader={<Loader />}
        renderWidget={renderWidget}
        renderFault={({ fault, retryRender }) => (
          <Center>
            <FaultComponent fault={fault} />
            <Button onClick={retryRender}>Попробовать еще раз</Button>
          </Center>
        )}
      />
    </div>
  );
}
