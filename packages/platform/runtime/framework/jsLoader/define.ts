import type { WidgetBundle } from "./WidgetBundle.js";

export type Config<TLiteral> = {
  readonly internalFieldSymbolId: string;
  readonly widgetExposeExternalsWindowField: TLiteral;
  readonly widgetServerUrl: string;
  readonly widgetBundle: WidgetBundle;
};

declare const __widgetPlatformFramework_jsloader_config__: Config<"literal-type">;

export const define = __widgetPlatformFramework_jsloader_config__;
