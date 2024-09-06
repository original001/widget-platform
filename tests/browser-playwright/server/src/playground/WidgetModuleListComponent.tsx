import { useCounter, useList } from "@react-hookz/web";
import type { WidgetFaultConstraint } from "@skbkontur/loader-builder";
import { usePersistentCallback } from "@skbkontur/widget-consumer-react-utils";
import { ErrorComponent, type ShowLoader, useWidgetApi } from "@skbkontur/widget-playground";
import type { JSX } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { importWidgetModuleViaNpmLoader } from "../npmLoader/importWidgetModuleViaNpmLoader.js";
import { FaultContainer } from "./FaultContainer.js";
import { FaultsComponent } from "./FaultsComponent.js";
import { getWidgetUrl } from "./getWidgetUrl.js";
import { ScriptType } from "./ScriptType.js";
import { WidgetApiController } from "./WidgetApiController.js";

type WidgetModuleGetButtonProps = { readonly onClick: () => void };

export function WidgetModuleGetButton({ onClick }: WidgetModuleGetButtonProps): JSX.Element {
  return <button onClick={onClick}>Скачать новый модуль виджета</button>;
}

type WidgetApiLoaderProps = {
  readonly processDisposeFault: (fault: WidgetFaultConstraint) => void;
  readonly showLoader: ShowLoader;
  readonly isolated: boolean;
  readonly scriptType: ScriptType;
  readonly message: string;
};

export function WidgetApiLoader({
  processDisposeFault,
  showLoader,
  isolated,
  scriptType,
  message,
}: WidgetApiLoaderProps): JSX.Element {
  const getWidgetApi = usePersistentCallback(
    () => importWidgetModuleViaNpmLoader(getWidgetUrl(isolated, scriptType), message),
    [isolated, scriptType, message]
  );
  const state = useWidgetApi(getWidgetApi, { processDisposeFault, showLoader });

  switch (state.type) {
    case "loading":
      return <>Загрузка</>;
    case "fault":
      return <FaultContainer fault={state.fault} />;
    case "success":
      return <WidgetApiController widgetApi={state.widgetApi} showLoader={showLoader} />;
  }
}

type ModuleDescription = {
  readonly isolated: boolean;
  readonly scriptType: ScriptType;
  readonly message: string;
};

type ModuleState = {
  readonly counter: number;
} & ModuleDescription;

type Props = {
  readonly showLoader: ShowLoader;
} & ModuleDescription;

export function WidgetModuleListComponent({ showLoader, isolated, scriptType, message }: Props): JSX.Element {
  const [widgetModules, { push: addWidgetModule, removeAt: removeWidgetModule }] = useList<ModuleState>([]);
  const [disposeFaults, { push: addFault }] = useList<WidgetFaultConstraint>([]);
  const [counter, { inc }] = useCounter();

  return (
    <>
      <WidgetModuleGetButton
        onClick={() => {
          inc();
          addWidgetModule({ isolated, scriptType, message, counter });
        }}
      />
      <FaultsComponent faults={disposeFaults} />
      {widgetModules.map((moduleImportParams, index) => {
        const { isolated, scriptType, message, counter } = moduleImportParams;
        return (
          <ErrorBoundary key={counter} fallbackRender={({ error }) => <ErrorComponent error={error} />}>
            <br />
            {`${counter}: (${isolated ? "iframe" : "none"}/${scriptType}/${message})`}
            <button onClick={() => removeWidgetModule(index)}>Убрать модуль виджета c экрана</button>
            <WidgetApiLoader
              processDisposeFault={addFault}
              showLoader={showLoader}
              message={message}
              isolated={isolated}
              scriptType={scriptType}
            />
          </ErrorBoundary>
        );
      })}
    </>
  );
}
