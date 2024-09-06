import type { CreateTestWidgetApi } from "../entry.js";
import { createWidgetApi as create } from "../entryLazy.js";
import { setExternals } from "./setExternals.js";

export const createWidgetApi: CreateTestWidgetApi = async ({ dependencies }) => {
  setExternals(dependencies, window);
  return create({ dependencies });
};
