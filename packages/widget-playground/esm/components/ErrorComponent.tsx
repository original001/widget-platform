import type { JSX } from "react";
import { isError } from "./isError.js";

declare global {
  interface Error {
    cause?: unknown;
  }
}

type Props = {
  readonly error: any;
};

export function ErrorComponent({ error }: Props): JSX.Element {
  if (isError(error)) {
    const { name, message, stack, cause } = error;
    return (
      <>
        {name}: {message}
        {stack ? (
          <>
            <br />
            {stack}
          </>
        ) : null}
        {cause ? (
          <>
            <br />
            Caused by: <ErrorComponent error={cause} />
          </>
        ) : null}
      </>
    );
  }

  return <>Error: {error ? JSON.stringify(error) : String(error)}</>;
}
