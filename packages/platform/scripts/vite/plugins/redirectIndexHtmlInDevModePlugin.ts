import type { Plugin } from "vite";

export function redirectIndexHtmlInDevMode(indexHtmlPath: string): Plugin {
  return {
    name: "vite-plugin-redirect-index-html-in-dev-mode",
    apply: "serve",
    configureServer(server) {
      return () =>
        server.middlewares.use(async (req, _, next) => {
          if (req.originalUrl === "/") {
            req.originalUrl = req.url;
            req.url = indexHtmlPath;
          }
          return next();
        });
    },
  };
}
