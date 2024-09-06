import { indexHtmlScriptAppender } from "@skbkontur/vite-plugin-index-html-config-appender";
import { type Plugin } from "vite";
import { generateViteFsPath } from "../generateViteFsPath.js";
import { generateSeparateTreePlugin, separateTreeKey } from "./generateSeparateTreePlugin.js";

export type ConfigDescription = {
  readonly filePath: string;
  readonly funcName: string;
};

export function viteAppendConfigScripts(
  htmlToConfigDescr: Record<string, ConfigDescription>,
  entryPath: string
): Plugin[] {
  return [
    generateSeparateTreePlugin(),
    ...Object.entries(htmlToConfigDescr).map(([html, descr]) => {
      const params = new URLSearchParams();
      params.set(separateTreeKey, html.replaceAll(".", ""));
      const children = `
  import { ${descr.funcName} as getConfig } from "${generateViteFsPath(descr.filePath)}?${params}";
  import render from "${generateViteFsPath(entryPath)}";
  render(getConfig)`;

      return indexHtmlScriptAppender({
        attrs: { type: "module" },
        fileName: html,
        children,
      });
    }),
  ];
}
