import { useState } from "react";

const equals = (deps1: readonly unknown[], deps2: readonly unknown[]): boolean =>
  deps1.length === deps2.length && deps1.every((dep, i) => dep === deps2[i]);

export function usePersistentCallback<T extends Function>(func: T, deps: readonly unknown[]): T {
  const [saved, setSaved] = useState({ func, deps });

  if (equals(saved.deps, deps)) {
    return saved.func;
  }

  setSaved({ func, deps });
  return func;
}
