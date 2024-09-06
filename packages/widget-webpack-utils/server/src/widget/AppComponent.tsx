import { Kebab } from "@skbkontur/react-ui";
import type { JSX, PropsWithChildren } from "react";
import { StrictMode } from "react";

export function AppComponent({ children }: PropsWithChildren): JSX.Element {
  return (
    <StrictMode>
      {children}
      <Kebab>
        <h1>Kebab content</h1>
      </Kebab>
    </StrictMode>
  );
}
