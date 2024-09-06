import { default as connect } from "connect";
import { existsSync } from "fs";
import type { ServerResponse } from "http";
import { join, resolve } from "path";
import { default as sirv } from "sirv";
import { createHttpsServer } from "./createHttpsServer.js";
import type { ViteArtifactsPaths } from "./getViteInlineConfigs.js";
import { previewHtmlName } from "./previewHtmlName.js";
import { serializeAddress } from "./serializeAddress.js";
import { widgetProdVirtualDirectoryName } from "./widgetProdVirtualDirectoryName.js";

const withMapExt = (str: string) => `${str}.map`;

function setSourceMapHeader(dir: string, pathname: string, res: ServerResponse) {
  if (!existsSync(join(dir, withMapExt(pathname)))) {
    return;
  }

  // Заголовок SourceMap не работает c модулями ES в браузерах на Chromium (Chrome, Edge 79+, Opera, Samsung Internet), работает в FF
  // https://github.com/mdn/browser-compat-data/issues/18183
  res.setHeader("SourceMap", withMapExt(pathname.split("/").pop() ?? ""));
}

const sirvWithSourceMaps = (path: string, indexHtml?: string) =>
  sirv(path, {
    dev: true,
    single: indexHtml ?? false,
    setHeaders: (res: ServerResponse, pathname: string) => setSourceMapHeader(path, pathname, res),
  });

type Result = {
  readonly address: string;
  readonly dispose: () => void;
};

type PreviewServerDirectories = Pick<
  ViteArtifactsPaths,
  | "artifactsWidgetAndLoaderDirectory"
  | "artifactsPlaygroundDirectory"
  | "artifactsStatsDirectory"
  | "playgroundPreviewDirectory"
>;

export function runPreviewServer(dirs: PreviewServerDirectories, port: number | undefined): Result {
  const app = connect();

  app.use("/", sirvWithSourceMaps(resolve(...dirs.playgroundPreviewDirectory), previewHtmlName));
  app.use("/", sirvWithSourceMaps(dirs.artifactsPlaygroundDirectory));
  app.use(`/${widgetProdVirtualDirectoryName}`, sirvWithSourceMaps(dirs.artifactsWidgetAndLoaderDirectory));
  app.use("/stats", sirv(resolve(...dirs.artifactsStatsDirectory)));

  const server = createHttpsServer(app, port);
  return {
    address: serializeAddress(server.address()),
    dispose() {
      server.close();
    },
  };
}
