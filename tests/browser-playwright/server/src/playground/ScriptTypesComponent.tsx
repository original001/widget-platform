import { Fragment, type JSX } from "react";
import { ScriptType } from "./ScriptType.js";

type ScriptTypeSelectRadioProps = {
  readonly scriptType: ScriptType;
  readonly selected: boolean;
  readonly onChange: (scriptType: ScriptType) => void;
};

export function ScriptTypeSelectRadio({ scriptType, selected, onChange }: ScriptTypeSelectRadioProps): JSX.Element {
  return (
    <input
      type="radio"
      value={scriptType}
      checked={selected}
      onChange={(e) => onChange(e.target.value as ScriptType)}
    />
  );
}

const scriptTypeDescriptions: Record<ScriptType, string> = {
  [ScriptType.ReactExternalsWindow]:
    "React с переиспользованием зависимостей с помощью подключения externals через window",
  [ScriptType.ReactExternalsClosure]:
    "React с переиспользованием зависимостей с помощью externals через локальные скоуп текущей функции-модуля",
  [ScriptType.ReactDuplicate]: "Копия React на странице",
  [ScriptType.ExplicitDependency]: "Явное переиспользование зависимости (immer) в createWidgetApi",
  [ScriptType.Plain]: "Обычный",
};

type ScriptTypesComponentProps = {
  readonly selectedScriptType: ScriptType;
  readonly setSelectedScriptType: (scriptType: ScriptType) => void;
};

export function ScriptTypesComponent({
  selectedScriptType,
  setSelectedScriptType,
}: ScriptTypesComponentProps): JSX.Element {
  return (
    <>
      {Object.values(ScriptType).map((scriptType) => (
        <Fragment key={scriptType}>
          <ScriptTypeSelectRadio
            selected={scriptType === selectedScriptType}
            scriptType={scriptType}
            onChange={setSelectedScriptType}
          />
          {scriptTypeDescriptions[scriptType]}
          <br />
        </Fragment>
      ))}
    </>
  );
}
