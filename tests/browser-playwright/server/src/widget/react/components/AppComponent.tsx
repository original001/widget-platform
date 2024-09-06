import { Kebab } from "@skbkontur/react-ui";
import type { JSX, PropsWithChildren } from "react";
import { StrictMode } from "react";
import { ModalComponent } from "./modal/ModalComponent.js";
import { TestComponent } from "./TestComponent.js";

export function AppComponent({ children }: PropsWithChildren): JSX.Element {
  return (
    <StrictMode>
      <TestComponent children={children} />
      <ModalComponent />
      <Kebab>
        <h1>Kebab content</h1>
      </Kebab>
    </StrictMode>
  );
}
