import type { CreateTestWidgetApi } from "../entry.js";
import { createWidgetApi as create } from "../entryLazy.js";
import { setDependencies } from "./dependencies.js";

export const createWidgetApi: CreateTestWidgetApi = ({ dependencies }) => {
  setDependencies(dependencies);
  return create({ dependencies });
};
