import type {
  GetPlaygroundDevConfig,
  GetPlaygroundEnvironmentConfig,
} from "../../../../lib/browser/defineEnvConfig.js";

export const getIndexHtmlConfig: GetPlaygroundEnvironmentConfig = async () => {
  return {
    loaderUrlPrefix: new URL("./widget/", window.location.href),
    environmentConfig: undefined,
  };
};

export const getDevConfig: GetPlaygroundDevConfig = async () => {
  return {
    environmentConfig: undefined,
  };
};
