import { ensureSuccess } from "@skbkontur/operation-result";
import type { RenderPlayground } from "@skbkontur/widget-platform/browser";
import { importWidgetModule } from "../../../npm-loader/framework/entry.js";

const renderPlayground: RenderPlayground<{}> = async ({ widgetUrl }) => {
  const result = await importWidgetModule({
    widgetUrl,
  });

  ensureSuccess(result);
};
export default renderPlayground;
