import { appendData } from "../appendData.js";
import type { TestDependencies } from "../npmLoader/TestDependencies.js";
import type { TestWidgetInitParams } from "../npmLoader/TestWidgetInitParams.js";
import type { CreateTestWidgetApi, CreateTestWidgetApiInitResult } from "./getCreateWidgetApi.js";
import { getCreateWidgetApi } from "./getCreateWidgetApi.js";
import { getIsolationMode } from "./getIsolationMode.js";
import { getMessageFromWidget } from "./getMessageFromWidget.js";
import { WidgetType } from "./WidgetType.js";

async function render(
  { moduleValue }: TestDependencies,
  { container, value }: TestWidgetInitParams
): Promise<CreateTestWidgetApiInitResult> {
  const message = getMessageFromWidget(getIsolationMode(), WidgetType.Vanilla, moduleValue, value);
  const nodes = appendData(document, container, message);
  return async () => nodes.forEach((node) => container.removeChild(node));
}

export const createWidgetApi: CreateTestWidgetApi = getCreateWidgetApi(render);
