import type { Plugin, ResolvedConfig } from "vite";

const rawRE = /([?&])raw(?:&|$)/;

export function devAssetsImportMetaUrlAppender(): Plugin {
  let config: ResolvedConfig;
  return {
    name: "vite-plugin-assets-import.meta.url-appender",
    apply: "serve",
    enforce: "pre",
    configResolved(c) {
      config = c;
    },
    transform(code, id) {
      if (!config.assetsInclude(id) || rawRE.test(id)) {
        return;
      }

      return {
        code: code.replace(/^export default (".+")$/, "export default new URL($1, import.meta.url).href"),
      };
    },
  };
}
