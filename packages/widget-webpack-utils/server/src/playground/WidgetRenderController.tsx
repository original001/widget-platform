import { Button, Center } from "@skbkontur/react-ui";
import { WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import { FaultComponent, useWidgetRenderCallback } from "@skbkontur/widget-playground";
import type { JSX } from "react";
import { baseURL } from "../../../constants.js";
import { importWidgetModuleViaNpmLoader } from "../npmLoader/importWidgetModuleViaNpmLoader.js";
import type { TestWidgetApiDisposeFaults } from "../npmLoader/types.js";
import { ExternalsType } from "./ExternalsType.js";

type Props = {
  readonly processDisposeFault: (fault: TestWidgetApiDisposeFaults) => void;
  readonly externalsType: ExternalsType;
  readonly message: string;
};

const showLoader = () => () => {};

export function WidgetRenderController({ processDisposeFault, externalsType, message }: Props): JSX.Element {
  const renderWidget = useWidgetRenderCallback(
    (container) => importWidgetModuleViaNpmLoader(new URL(`${externalsType}.js`, baseURL), container, message),
    [externalsType, message],
    { processDisposeFault, showLoader }
  );

  return (
    <WidgetRenderer
      loader={"Загрузка"}
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
