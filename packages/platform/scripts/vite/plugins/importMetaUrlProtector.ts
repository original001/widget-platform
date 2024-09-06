import type { Plugin } from "vite";

export function importMetaUrlProtector(): Plugin {
  return {
    name: "rollup-plugin-import-meta-url-protector",
    resolveImportMeta(property) {
      if (property === "url") {
        return "import.meta.url";
      }

      return null;
    },
  };
}
