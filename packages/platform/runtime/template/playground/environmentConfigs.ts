import type { GetPlaygroundDevConfig } from "@skbkontur/widget-platform/browser";

export const getDevConfig: GetPlaygroundDevConfig<{}> = async () => {
  return {
    environmentConfig: {},
  };
};
