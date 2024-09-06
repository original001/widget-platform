import type { GetPlaygroundEnvironmentConfig } from "@skbkontur/widget-platform/browser";
import renderPlayground from "playground/index.js";
import type { PlaygroundDefines } from "./define.js";

declare const jsLoaderSuffix: PlaygroundDefines["jsLoaderSuffix"];

export default async (getEnvConfig: GetPlaygroundEnvironmentConfig<{}>) => {
  const envConfig = await getEnvConfig();
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("No root");

  renderPlayground({
    container: rootElement,
    environmentConfig: envConfig.environmentConfig,
    widgetUrl: new URL(jsLoaderSuffix, envConfig.loaderUrlPrefix),
  });
};
