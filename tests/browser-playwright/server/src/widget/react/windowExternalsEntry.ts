import type { TestExternals } from "../../npmLoader/TestExternals.js";
import type { CreateTestWidgetApi } from "../getCreateWidgetApi.js";

declare global {
  interface Window {
    externals: TestExternals;
  }
}

export const createWidgetApi: CreateTestWidgetApi = async ({ dependencies }) => {
  window.externals = dependencies.externals;
  const { createWidgetApi } = await import(/* webpackMode: "eager" */ "./entry.js");
  return await createWidgetApi({ dependencies });
};
