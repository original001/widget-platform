import { defaultImport } from "default-import";
import babel from "vite-plugin-babel";

export function getPatchStringPlugin(filter: RegExp, search: string, replace: string) {
  return defaultImport(babel)({
    filter,
    babelConfig: {
      plugins: [
        [
          "search-and-replace",
          {
            rules: [
              {
                search,
                replace,
              },
            ],
          },
        ],
      ],
    },
  });
}
