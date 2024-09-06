import type { Plugin } from "vite";

export function virtualModulePlugin(virtualModuleId: string, content: string): Plugin {
  return {
    name: "rollup-plugin-virtual-module",
    resolveId(id): string | void {
      if (id === virtualModuleId) {
        return virtualModuleId;
      }
    },
    load(id): string | void {
      if (id === virtualModuleId) {
        return content;
      }
    },
  };
}
