import { useCounter, useList } from "@react-hookz/web";
import { ErrorComponent, FaultComponent } from "@skbkontur/widget-playground";
import type { JSX } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { TestWidgetApiDisposeFaults } from "../npmLoader/types.js";
import { ExternalsType } from "./ExternalsType.js";
import { WidgetRenderController } from "./WidgetRenderController.js";

type WidgetModuleGetButtonProps = { readonly onClick: () => void };

export function WidgetModuleGetButton({ onClick }: WidgetModuleGetButtonProps): JSX.Element {
  return <button onClick={onClick}>Скачать новый модуль виджета</button>;
}

type Props = {
  readonly externalsType: ExternalsType;
  readonly message: string;
};

type ModuleState = {
  readonly counter: number;
} & Props;

export function WidgetModuleListComponent({ externalsType, message }: Props): JSX.Element {
  const [disposeFaults, { push: processDisposeFault }] = useList<TestWidgetApiDisposeFaults>([]);
  const [widgetModules, { push: addWidgetModule, removeAt: removeWidgetModule }] = useList<ModuleState>([]);
  const [counter, { inc }] = useCounter();

  return (
    <>
      <WidgetModuleGetButton
        onClick={() => {
          inc();
          addWidgetModule({ externalsType, message, counter });
        }}
      />
      {widgetModules.map((moduleImportParams, index) => {
        const { externalsType, message, counter } = moduleImportParams;
        return (
          <ErrorBoundary key={counter} fallbackRender={({ error }) => <ErrorComponent error={error} />}>
            <br />
            {`${counter}: ${externalsType}/${message})`}
            <button onClick={() => removeWidgetModule(index)}>Убрать модуль виджета c экрана</button>
            <WidgetRenderController
              processDisposeFault={processDisposeFault}
              externalsType={externalsType}
              message={message}
            />
          </ErrorBoundary>
        );
      })}
      {disposeFaults.map((fault, index) => (
        <FaultComponent key={index} fault={fault} />
      ))}
    </>
  );
}
