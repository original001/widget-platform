import type { CreateTestWidgetApi } from "../entry.js";
import { setDependencies } from "./dependencies.js";

export const createWidgetApi: CreateTestWidgetApi = async ({ dependencies }) => {
  setDependencies(dependencies);
  const { createWidgetApi } = await import(/* webpackMode: "eager" */ "../entry.js");
  return await createWidgetApi({ dependencies });
};
