import url from "url";

export function getFrameworkPaths() {
  const root = url.fileURLToPath(new URL("..", import.meta.url));
  const frameworkRuntimeDirectory = [root, "runtime"];
  return {
    frameworkRuntimeDirectory,
  };
}
