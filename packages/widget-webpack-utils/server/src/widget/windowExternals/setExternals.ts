import type { TestExternals } from "../../npmLoader/TestExternals.js";
import type { TestDependencies } from "../../npmLoader/types.js";

declare global {
  interface Window {
    externals: TestExternals;
  }
}

export function setExternals({ externals }: TestDependencies, window: Window): void {
  window.externals = externals;
}
