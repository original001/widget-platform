import { getDevConfig as getUserDevConfig } from "playground/environmentConfigs.js";
import type { GetPlaygroundEnvironmentConfig } from "../../../lib/browser/defineEnvConfig.js";
import type { PlaygroundDefines } from "./define.js";

declare const jsLoaderDevConfigBase: PlaygroundDefines["jsLoaderDevConfigBase"];

export const getDevConfig: GetPlaygroundEnvironmentConfig<{}> = async () => {
  const { environmentConfig } = await getUserDevConfig();
  const loaderUrlPrefix = new URL(jsLoaderDevConfigBase, window.location.href);
  return {
    loaderUrlPrefix: loaderUrlPrefix,
    environmentConfig,
  };
};
