import type { GetPlaygroundDevConfig, GetPlaygroundEnvironmentConfig } from "@skbkontur/widget-platform/browser";
import type { EnvironmentConfig } from "./EnvironmentConfig.js";

export const getCloudConfig: GetPlaygroundEnvironmentConfig<EnvironmentConfig> = async () => {
  return {
    loaderUrlPrefix: new URL("../widget/", window.location.href), // относительно .artifacts/playground
    environmentConfig: {
      message: "FROM-PLAYGROUND",
    },
  };
};

export const getDevConfig: GetPlaygroundDevConfig<EnvironmentConfig> = async () => {
  return {
    environmentConfig: {
      message: "FROM-PLAYGROUND",
    },
  };
};
