import type { TestExternals } from "./TestExternals.js";

export type TestDependencies = {
  readonly externals: TestExternals;
  readonly moduleValue: string;
};
