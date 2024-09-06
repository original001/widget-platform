export function patchNpmLoaderExternals(sharedModules: ReadonlyArray<string>): string[] {
  const copy = sharedModules.slice();

  if (copy.includes("react")) {
    const jsxRuntime = "react/jsx-runtime";
    if (!copy.includes(jsxRuntime)) {
      copy.push(jsxRuntime);
    }
  }

  return copy;
}
