import type { Disposable, WidgetFaultConstraint } from "@skbkontur/loader-builder";
import { isFailure } from "@skbkontur/operation-result";
import { ErrorComponent } from "@skbkontur/widget-playground";
import { observable } from "mobx";
import { observer } from "mobx-react-lite";
import type { JSX } from "react";
import { FaultsComponent } from "./FaultsComponent.js";

type ManualDisposeButtonProps = {
  readonly dispose: () => void;
  readonly text: string;
};

export function ManualDisposeButton({ text, dispose }: ManualDisposeButtonProps): JSX.Element {
  return <button onClick={dispose}>{text}</button>;
}

export class ManualDisposeContainer {
  private readonly privateFaults: WidgetFaultConstraint[] = observable([]);
  private readonly privateErrors: unknown[] = observable([]);

  constructor(private readonly disposable: Disposable<WidgetFaultConstraint>) {}

  readonly faults: ReadonlyArray<WidgetFaultConstraint> = this.privateFaults;
  readonly errors: ReadonlyArray<unknown> = this.privateErrors;

  dispose = (): void => {
    this.disposable.dispose().then(
      (disposeResult) => {
        if (isFailure(disposeResult)) {
          this.privateFaults.push(disposeResult.fault);
        }
      },
      (error) => this.privateErrors.push(error)
    );
  };
}

type Props = {
  readonly container: ManualDisposeContainer;
  readonly buttonText: string;
};

export const ManualDisposer = observer(({ container, buttonText }: Props) => {
  return (
    <>
      {container.errors.map((error, index) => (
        <ErrorComponent key={index} error={error} />
      ))}
      <FaultsComponent faults={container.faults.slice()} />
      <ManualDisposeButton dispose={container.dispose} text={buttonText} />
    </>
  );
});
