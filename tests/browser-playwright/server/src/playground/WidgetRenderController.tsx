import { useList } from "@react-hookz/web";
import { isFailure } from "@skbkontur/operation-result";
import { Button, Center, Toggle } from "@skbkontur/react-ui";
import { WidgetRenderer } from "@skbkontur/widget-consumer-react-utils";
import { type ShowLoader, useWidgetRenderCallback } from "@skbkontur/widget-playground";
import { Fragment, type JSX, useState } from "react";
import type { TestWidgetInit } from "../npmLoader/importWidgetModuleViaNpmLoader.js";
import type { TestWidgetApiInitDisposeFaults } from "../npmLoader/types.js";
import { FaultContainer } from "./FaultContainer.js";
import { FaultsComponent } from "./FaultsComponent.js";
import { ManualDisposeContainer, ManualDisposer } from "./ManualDisposer.js";

type Props = {
  readonly showLoader: ShowLoader;
  readonly value: string;
  readonly render: TestWidgetInit;
};

export function WidgetRenderController({ showLoader, render, value }: Props): JSX.Element {
  const [disposeContainers, { push: addDisposeContainer }] = useList<ManualDisposeContainer>([]);
  const [show, setShow] = useState(true);
  const [disposeFaults, { push: processDisposeFault }] = useList<TestWidgetApiInitDisposeFaults>([]);

  const renderWidget = useWidgetRenderCallback(
    async (container) => {
      const renderResult = await render({ container, value });
      if (isFailure(renderResult)) {
        return renderResult;
      }

      const disposeContainer = new ManualDisposeContainer(renderResult.value);
      addDisposeContainer(disposeContainer);

      return renderResult;
    },
    [render, value, addDisposeContainer],
    { processDisposeFault, showLoader }
  );
  return (
    <>
      <FaultsComponent faults={disposeFaults} />
      <Toggle checked={show} onChange={() => setShow(!show)}>
        Отображать виджет
      </Toggle>
      {show && (
        <WidgetRenderer
          loader={"Загрузка"}
          renderWidget={renderWidget}
          renderFault={({ fault, retryRender }) => (
            <Center>
              <FaultContainer fault={fault} />
              <Button onClick={retryRender}>Попробовать еще раз</Button>
            </Center>
          )}
        />
      )}
      {disposeContainers
        .slice()
        .reverse()
        .map((container, index) => (
          <Fragment key={index}>
            <ManualDisposer container={container} buttonText="Вызвать вручную dispose виджета сверху" />
            <br />
          </Fragment>
        ))}
    </>
  );
}
