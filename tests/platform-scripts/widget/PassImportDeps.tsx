import type { JSX } from "react";

type Props = {
  readonly message: string;
};

export default function PassImportDeps({ message }: Props): JSX.Element {
  return <div>{message + "-HOT"}</div>;
}
