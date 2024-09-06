import type { JSX } from "react";

type Props = {
  readonly value: string;
  readonly onChange: (newValue: string) => void;
};

export function InputForModalComponent({ value, onChange }: Props): JSX.Element {
  return <input value={value} onChange={(val) => onChange(val.target.value)} />;
}
