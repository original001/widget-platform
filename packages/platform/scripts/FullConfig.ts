import type { JsLoaderConfig, PlaygroundConfig, WidgetConfig } from "../lib/node/config.js";

export type FullConfig = {
  readonly playgroundConfig: PlaygroundConfig;
  readonly jsLoaderConfig: JsLoaderConfig;
  readonly widgetConfig: WidgetConfig;
  readonly sharedModules: string[];
};
