import type { JSX, PropsWithChildren } from "react";

export function ModalLabelComponent({ children }: PropsWithChildren): JSX.Element {
  return <h4>{children}</h4>;
}
