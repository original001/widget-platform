import { Button } from "@skbkontur/react-ui";
import type { JSX } from "react";

type Props = { readonly onClick: () => void };

export function ModalOpenButton({ onClick }: Props): JSX.Element {
  return <Button onClick={onClick}>Open modal</Button>;
}
