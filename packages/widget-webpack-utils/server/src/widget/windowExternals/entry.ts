import type { CreateTestWidgetApi } from "../entry.js";
import { setExternals } from "./setExternals.js";

export const createWidgetApi: CreateTestWidgetApi = async ({ dependencies }) => {
  setExternals(dependencies, window);
  const { createWidgetApi } = await import(/* webpackMode: "eager" */ "../entry.js");
  return await createWidgetApi({ dependencies });
};
