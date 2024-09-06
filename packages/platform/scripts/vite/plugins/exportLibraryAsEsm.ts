import type { Plugin } from "vite";
import { addToEntryChunk } from "./addToEntryChunk.js";

interface Params {
  readonly libraryName: string;
}

export function exportLibraryAsEsm({ libraryName }: Params): Plugin {
  return {
    name: "rollup-plugin-export-library-as-esm",
    footer: addToEntryChunk(`export const createWidgetApi = ${libraryName}.createWidgetApi;`),
  };
}
