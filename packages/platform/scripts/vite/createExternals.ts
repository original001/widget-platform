export function createExternals(exposeFieldName: string, moduleNames: readonly string[]): Record<string, string> {
  const allExternals = moduleNames.map((moduleName) => [moduleName, `${exposeFieldName}["${moduleName}"]`]);

  return Object.fromEntries(allExternals);
}
