import type { RenderedChunk } from "rollup";

export const addToEntryChunk =
  (code: string) =>
  (chunk: RenderedChunk): string =>
    chunk.isEntry ? code : "";
