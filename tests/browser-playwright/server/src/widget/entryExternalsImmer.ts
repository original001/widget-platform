import { appendData } from "../appendData.js";
import type { TestDependencies } from "../npmLoader/TestDependencies.js";
import type { TestWidgetInitParams } from "../npmLoader/TestWidgetInitParams.js";
import type { CreateTestWidgetApi, CreateTestWidgetApiInitResult } from "./getCreateWidgetApi.js";
import { getCreateWidgetApi } from "./getCreateWidgetApi.js";
import { getIsolationMode } from "./getIsolationMode.js";
import { getMessageFromWidget } from "./getMessageFromWidget.js";
import { WidgetType } from "./WidgetType.js";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function render(
  { externals, moduleValue }: TestDependencies,
  { container, value }: TestWidgetInitParams
): Promise<CreateTestWidgetApiInitResult> {
  await delay(50);
  const original = { message: "unused" };
  const { message } = externals.immer.produce(original, (draft) => {
    draft.message = getMessageFromWidget(getIsolationMode(), WidgetType.Immer, moduleValue, value);
  });

  const nodes = appendData(document, container, message);
  return async () => {
    await delay(50);
    nodes.forEach((node) => container.removeChild(node));
  };
}

export const createWidgetApi: CreateTestWidgetApi = getCreateWidgetApi(render);
