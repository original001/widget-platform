import type { WidgetFaultConstraint } from "@skbkontur/loader-builder";
import type { JSX } from "react";
import { FaultContainer } from "./FaultContainer.js";

type Props = { readonly faults: readonly WidgetFaultConstraint[] };

export function FaultsComponent({ faults }: Props): JSX.Element {
  return (
    <>
      {faults.map((fault, index) => (
        <FaultContainer key={index} fault={fault} />
      ))}
    </>
  );
}
