import type { WidgetFaultConstraint } from "@skbkontur/loader-builder";
import type { JSX } from "react";
import { ErrorComponent } from "./ErrorComponent.js";
import { isError } from "./isError.js";

function replacer(_: string, value: any) {
  if (isError(value)) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      cause: value.cause,
    };
  }
  return value;
}

type Props = {
  readonly fault: WidgetFaultConstraint & { readonly error?: unknown };
};

export function FaultComponent({ fault }: Props): JSX.Element {
  const { type, message, error, ...rest } = fault;

  return (
    <>
      Fault({type}): {message}. {JSON.stringify(rest, replacer)}
      {error ? (
        <>
          <br />
          <ErrorComponent error={error} />
        </>
      ) : null}
    </>
  );
}
