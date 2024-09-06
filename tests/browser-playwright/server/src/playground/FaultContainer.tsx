import type { WidgetFaultConstraint } from "@skbkontur/loader-builder";
import { FaultComponent } from "@skbkontur/widget-playground";
import type { JSX } from "react";

type Props = {
  readonly fault: WidgetFaultConstraint;
};

export function FaultContainer({ fault }: Props): JSX.Element {
  return (
    <div>
      <FaultComponent fault={fault} />
    </div>
  );
}
