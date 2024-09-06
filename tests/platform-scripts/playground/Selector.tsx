import type { Mode } from "platform-scripts-npm-loader";
import { ModeType, SingleModeType } from "platform-scripts-npm-loader";
import type { JSX, ReactNode } from "react";
import { useState } from "react";
import type { EnvironmentConfig } from "./EnvironmentConfig.js";
import { SelectorButton } from "./SelectorButton.js";

type Props = {
  readonly config: EnvironmentConfig;
  readonly children: (mode: Mode) => ReactNode;
};

export function Selector({ config, children }: Props): JSX.Element {
  const [mode, setMode] = useState<Mode | null>(null);

  return (
    <>
      <SelectorButton onClick={setMode} mode={{ type: ModeType.PassImportDeps, message: config.message }} />
      {Object.values(SingleModeType).map((type) => (
        <SelectorButton onClick={setMode} mode={{ type }} key={type} />
      ))}
      {mode === null ? null : children(mode)}
    </>
  );
}
