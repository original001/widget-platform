import type { CreateTestWidgetApi } from "./entry.js";

export const createWidgetApi: CreateTestWidgetApi = async ({ dependencies }) => {
  const { createWidgetApi } = await import("./entry.js");
  return await createWidgetApi({ dependencies });
};
