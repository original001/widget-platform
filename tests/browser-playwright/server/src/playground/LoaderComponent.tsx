import { useLocalStorageValue } from "@react-hookz/web";
import { GlobalLoader } from "@skbkontur/react-ui";
import { useGlobalLoader } from "@skbkontur/widget-playground";
import { type JSX, StrictMode } from "react";
import { ScriptType } from "./ScriptType.js";
import { ScriptTypesComponent } from "./ScriptTypesComponent.js";
import { WidgetModuleListComponent } from "./WidgetModuleListComponent.js";

type CheckboxProps = {
  readonly checked: boolean;
  readonly onChange: () => void;
};

export function IsolationModeCheckbox({ checked, onChange }: CheckboxProps): JSX.Element {
  return <input type="checkbox" checked={checked} onChange={onChange} />;
}

export function LoaderComponent(): JSX.Element {
  const [active, { showLoader }] = useGlobalLoader();
  const { value: isolated, set: setIsolated } = useLocalStorageValue("e2e-playwright-tests-isolated", {
    defaultValue: true,
    initializeWithValue: true,
  });
  const { value: message, set: setMessage } = useLocalStorageValue("e2e-playwright-tests-message", {
    defaultValue: "message",
    initializeWithValue: true,
  });
  const { value: selectedScriptType, set: setSelectedScriptType } = useLocalStorageValue(
    "e2e-playwright-tests-scriptType",
    { defaultValue: ScriptType.ReactExternalsClosure, initializeWithValue: true }
  );

  return (
    <>
      <GlobalLoader active={active} />
      <StrictMode>
        <IsolationModeCheckbox checked={isolated} onChange={() => setIsolated(!isolated)} />
        Изоляция с помощью iframe
        <br />
        <ScriptTypesComponent
          selectedScriptType={selectedScriptType}
          setSelectedScriptType={(scriptType) => setSelectedScriptType(scriptType)}
        />
        <input value={message} onChange={(val) => setMessage(val.target.value)} />
        <WidgetModuleListComponent
          showLoader={showLoader}
          isolated={isolated}
          scriptType={selectedScriptType}
          message={message}
        />
      </StrictMode>
    </>
  );
}
