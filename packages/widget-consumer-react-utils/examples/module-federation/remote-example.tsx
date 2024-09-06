import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

export type Dependencies = {
  readonly account: string;
  readonly container: HTMLElement;
};

export function mount({ account, container }: Dependencies): VoidFunction {
  const root = createRoot(container);
  root.render(<StrictMode>Account: {account}</StrictMode>);

  return () => root.unmount();
}
