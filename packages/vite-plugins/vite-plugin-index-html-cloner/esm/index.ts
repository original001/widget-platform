import { basename, resolve } from "path";
import { normalizePath } from "vite";
import type { Plugin, UserConfig } from "vite";

interface IDevIndexHtmlClonerOptions {
  readonly allHtmls: readonly string[];
  readonly template: string;
}

export function indexHtmlCloner(options: IDevIndexHtmlClonerOptions): Plugin {
  const { allHtmls, template } = options;
  return {
    name: "vite-index-html-copier",
    configureServer(server) {
      return () =>
        server.middlewares.use(async (req, res, next) => {
          const matchedUrl = [req.url, req.originalUrl].find((url) => url && allHtmls.includes(basename(url)));
          if (matchedUrl) {
            res.end(await server.transformIndexHtml(matchedUrl, template));
            return;
          }
          return next();
        });
    },
    config(config: UserConfig): void {
      const build = (config.build = config.build ?? {});
      const rollupOptions = (build.rollupOptions = build.rollupOptions ?? {});

      const prepareInput = (): { [entryAlias: string]: string } => {
        const { input } = rollupOptions;
        if (!input) {
          return {};
        }

        if (typeof input === "string") {
          return {
            input,
          };
        }
        return Array.isArray(input) ? input.reduce((acc, key) => ({ ...acc, [basename(key)]: key }), {}) : input;
      };

      const root = config.root as string;

      rollupOptions.input = {
        ...prepareInput(),
        ...allHtmls.reduce((acc, key) => ({ ...acc, [key]: resolve(root, key) }), {}),
      };
    },
    resolveId(id: string): string | undefined {
      if (allHtmls.includes(basename(id))) {
        return normalizePath(resolve(id));
      }

      return undefined;
    },
    load(id: string): string | undefined {
      if (allHtmls.includes(basename(id))) {
        return template;
      }

      return undefined;
    },
  };
}
