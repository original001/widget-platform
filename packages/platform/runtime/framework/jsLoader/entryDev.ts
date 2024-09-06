/*
    Обычно этот импорт зашивает vite при dev-режиме в index.html, но у widget.js нет своей index.html,
    поэтому ему нужно помочь. Иначе в dev не подставятся vite.config-овские define-ы.

    См. https://vitejs.dev/guide/backend-integration. Правда, там советуют в html-ку зашить, а мы -- в скрипт.
 */
import "/@vite-plugin-checker-runtime-entry";
import "/@vite/client";
import { combineUrl } from "./combineUrl.js";
import { createScriptConfigurator } from "./configurators/createScriptConfigurator.js";
import { configurators } from "./entry.js";

await import(/* @vite-ignore */ combineUrl("/@vite/client").href);
await import(/* @vite-ignore */ combineUrl("/@vite-plugin-checker-runtime-entry").href);

configurators.push(
  createScriptConfigurator("/@vite/client"),
  createScriptConfigurator("/framework/inject-react.js"),
  createScriptConfigurator("/framework/inject-mobx.js")
);

export { createWidgetApi } from "./entry.js";
