export function getCleanModuleName(str: string): string {
  return str
    .replace(/[-\/]([a-z])/g, function (_: unknown, letter: string) {
      return letter.toUpperCase();
    })
    .replace(/[\/@]/g, "_");
}
