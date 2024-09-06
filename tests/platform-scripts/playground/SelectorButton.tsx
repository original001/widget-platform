import type { Mode } from "platform-scripts-npm-loader";
import type { JSX } from "react";

type Props = {
  readonly mode: Mode;
  readonly onClick: (mode: Mode) => void;
};

export const SelectorButton = ({ mode, onClick }: Props): JSX.Element => (
  <button data-testid={mode.type} onClick={() => onClick(mode)}>
    {mode.type}
  </button>
);
