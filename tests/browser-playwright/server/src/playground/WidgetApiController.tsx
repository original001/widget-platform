import { useList } from "@react-hookz/web";
import type { ShowLoader } from "@skbkontur/widget-playground";
import { type JSX, useState } from "react";
import type { TestWidgetApi } from "../npmLoader/importWidgetModuleViaNpmLoader.js";
import { ManualDisposeContainer, ManualDisposer } from "./ManualDisposer.js";
import { WidgetRenderController } from "./WidgetRenderController.js";

type WidgetInitButtonProps = { readonly onClick: () => void };

export function WidgetInitButton({ onClick }: WidgetInitButtonProps): JSX.Element {
  return <button onClick={onClick}>Инициализировать виджет со значением</button>;
}

type WidgetInitInputProps = {
  readonly value: string;
  readonly onChange: (newValue: string) => void;
};

export function WidgetInitInput({ value, onChange }: WidgetInitInputProps): JSX.Element {
  return <input value={value} onChange={(val) => onChange(val.target.value)} />;
}

type Props = {
  readonly showLoader: ShowLoader;
  readonly widgetApi: TestWidgetApi;
};

export function WidgetApiController({ widgetApi, showLoader }: Props): JSX.Element {
  const [disposeContainer] = useState(() => new ManualDisposeContainer(widgetApi));
  const [value, setValue] = useState("example 1");
  const [shownValues, { push: addShownValue }] = useList<string>([]);

  return (
    <div>
      <WidgetInitInput value={value} onChange={setValue} />
      <WidgetInitButton onClick={() => addShownValue(value)} />
      <br />
      {shownValues.map((currentValue, index) => (
        <WidgetRenderController key={index} value={currentValue} render={widgetApi.init} showLoader={showLoader} />
      ))}
      <ManualDisposer container={disposeContainer} buttonText="Убрать модуль виджета выше из контекста" />
    </div>
  );
}
