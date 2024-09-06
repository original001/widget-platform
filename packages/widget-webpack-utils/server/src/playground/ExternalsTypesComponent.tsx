import { Fragment, type JSX } from "react";
import { ExternalsType } from "./ExternalsType.js";

type ExternalsTypeSelectRadioProps = {
  readonly externalsType: ExternalsType;
  readonly selected: boolean;
  readonly onChange: (externalsType: ExternalsType) => void;
};

export function ExternalsTypeSelectRadio({
  externalsType,
  selected,
  onChange,
}: ExternalsTypeSelectRadioProps): JSX.Element {
  return (
    <input
      type="radio"
      value={externalsType}
      checked={selected}
      onChange={(e) => onChange(e.target.value as ExternalsType)}
    />
  );
}

const externalsTypeDescriptions: Record<ExternalsType, string> = {
  [ExternalsType.ModuleEsmLazy]: "ESM с переиспользованием зависимостей через переменную модуля в отдельном чанке",
  [ExternalsType.ModuleEsm]: "ESM с переиспользованием зависимостей через переменную модуля",
  [ExternalsType.ModuleLazy]: "Переиспользование зависимостей через переменную модуля в отдельном чанке",
  [ExternalsType.Module]: "Переиспользование зависимостей через переменную модуля",
  [ExternalsType.WindowEsmLazy]: "ESM с переиспользованием зависимостей через window в отдельном чанке",
  [ExternalsType.WindowEsm]: "ESM с переиспользованием зависимостей через window",
  [ExternalsType.WindowLazy]: "Переиспользование зависимостей через window в отдельном чанке",
  [ExternalsType.Window]: "Переиспользование зависимостей через window",
  [ExternalsType.ClosureLazy]:
    "Переиспользование зависимостей  через локальные скоуп текущей функции-модуля в отдельном чанке",
  [ExternalsType.Closure]: "Переиспользование зависимостей через локальные скоуп текущей функции-модуля",
  [ExternalsType.ClosureDuplicateLazy]:
    "Отказ переиспользования зависимостей через локальные скоуп текущей функции-модуля в отдельном чанке",
  [ExternalsType.ClosureDuplicate]: "Отказ переиспользования зависимостей через локальные скоуп текущей функции-модуля",
  [ExternalsType.Duplicate]: "Копия зависимостей на странице",
};

type ExternalsTypesComponentProps = {
  readonly selectedExternalsType: ExternalsType;
  readonly setSelectedExternalsType: (externalsType: ExternalsType) => void;
};

export function ExternalsTypesComponent({
  selectedExternalsType,
  setSelectedExternalsType,
}: ExternalsTypesComponentProps): JSX.Element {
  return (
    <>
      {Object.values(ExternalsType).map((externalsType) => (
        <Fragment key={externalsType}>
          <ExternalsTypeSelectRadio
            selected={externalsType === selectedExternalsType}
            externalsType={externalsType}
            onChange={setSelectedExternalsType}
          />
          {externalsTypeDescriptions[externalsType]}
          <br />
        </Fragment>
      ))}
    </>
  );
}
