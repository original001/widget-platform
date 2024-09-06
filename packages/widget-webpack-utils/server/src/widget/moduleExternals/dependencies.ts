import type { TestExternals } from "../../npmLoader/TestExternals.js";
import type { TestDependencies } from "../../npmLoader/types.js";

// CommonJS не имеет права получать доступ к dependencies синхронно, но это работает в webpack. Стоит починить.
export let externals: TestExternals;

export function setDependencies(dependencies: TestDependencies): void {
  externals = dependencies.externals;
}
