import type { LoadResult } from "rollup";
import { URLSearchParams } from "url";
import type { Plugin } from "vite";

export const separateTreeKey = "separateTree";

function parseId(id: string) {
  const [url, query] = id.split("?");
  const search = new URLSearchParams(query);
  return { url, treeId: search.get(separateTreeKey) };
}

export function generateSeparateTreePlugin(): Plugin {
  return {
    name: "rollup-plugin-generate-separate-tree",
    enforce: "pre",
    apply: "build",
    async resolveId(id, importer, options): Promise<string | void> {
      if (importer === undefined) {
        return;
      }

      const { url, treeId } = parseId(importer);
      if (treeId === null) {
        return;
      }

      const resolveResult = await this.resolve(id, url, options)!;

      const [idUrl, query] = resolveResult!.id.split("?");
      const search = new URLSearchParams(query);
      search.set(separateTreeKey, treeId);
      return `${idUrl}?${search}`;
    },
    async load(id): Promise<LoadResult | void> {
      const { url, treeId } = parseId(id);

      if (treeId !== null) {
        const originalId = url!;
        const { code, ast } = await this.load({ id: originalId });
        if (!code) {
          return null;
        }
        if (!ast) {
          return code;
        }
        return { code, ast };
      }
    },
  };
}
