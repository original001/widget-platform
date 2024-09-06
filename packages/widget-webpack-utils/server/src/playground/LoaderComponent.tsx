import { useLocalStorageValue } from "@react-hookz/web";
import { type JSX, StrictMode } from "react";
import { ExternalsType } from "./ExternalsType.js";
import { ExternalsTypesComponent } from "./ExternalsTypesComponent.js";
import { WidgetModuleListComponent } from "./WidgetModuleListComponent.js";

type WidgetImportInputProps = {
  readonly value: string;
  readonly onChange: (newValue: string) => void;
};

export function WidgetImportInput({ value, onChange }: WidgetImportInputProps): JSX.Element {
  return <input value={value} onChange={(val) => onChange(val.target.value)} />;
}

export function LoaderComponent(): JSX.Element {
  const { value: message, set: setMessage } = useLocalStorageValue("webpack-playwright-tests-message", {
    defaultValue: "message",
    initializeWithValue: true,
  });
  const { value: selectedExternalsType, set: setSelectedExternalsType } = useLocalStorageValue(
    "webpack-playwright-tests-externalsType",
    { defaultValue: ExternalsType.ClosureLazy, initializeWithValue: true }
  );

  return (
    <StrictMode>
      <ExternalsTypesComponent
        selectedExternalsType={selectedExternalsType}
        setSelectedExternalsType={(externalsType) => setSelectedExternalsType(externalsType)}
      />
      <WidgetImportInput value={message} onChange={setMessage} />
      <WidgetModuleListComponent externalsType={selectedExternalsType} message={message} />
    </StrictMode>
  );
}
