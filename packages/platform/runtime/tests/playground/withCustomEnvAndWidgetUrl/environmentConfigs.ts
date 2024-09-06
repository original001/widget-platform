import type {
  GetPlaygroundDevConfig,
  GetPlaygroundEnvironmentConfig,
} from "../../../../lib/browser/defineEnvConfig.js";

export type PlaygroundConfig = { messageFromConfig: string };

export const messageFromConfigForDev = "in dev mode";
export const messageFromConfigForServe = "in serve mode";
export const pathToServePlayground = "/some/playground/path/";
export const pathToServeWidget = "/some/widget/path/";
export const pathFromPlaygroundToWidget = "../../widget/path/";

export const getServedEnvConfig: GetPlaygroundEnvironmentConfig<PlaygroundConfig> = async () => {
  return {
    loaderUrlPrefix: new URL(pathFromPlaygroundToWidget, window.location.href),
    environmentConfig: {
      messageFromConfig: messageFromConfigForDev,
    },
  };
};

export const getDevConfig: GetPlaygroundDevConfig<PlaygroundConfig> = async () => {
  return {
    environmentConfig: {
      messageFromConfig: messageFromConfigForServe,
    },
  };
};
