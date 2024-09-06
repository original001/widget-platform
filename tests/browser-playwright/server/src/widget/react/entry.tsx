import { createRoot } from "react-dom/client";
import * as markUsed from "./react-iframe-window.js";
import { type CreateTestWidgetApi, getCreateWidgetApi } from "../getCreateWidgetApi.js";
import { getIsolationMode } from "../getIsolationMode.js";
import { getMessageFromWidget } from "../getMessageFromWidget.js";
import { WidgetType } from "../WidgetType.js";
import { AppComponent } from "./components/AppComponent.js";

const hot = import.meta.webpackHot;
if (hot && markUsed) {
  hot.accept();
}

export const createWidgetApi: CreateTestWidgetApi = getCreateWidgetApi(
  async ({ moduleValue }, { container, value }) => {
    const message = getMessageFromWidget(getIsolationMode(), WidgetType.React, moduleValue, value);
    const root = createRoot(container);
    root.render(<AppComponent>{message}</AppComponent>);
    return async () => root.unmount();
  }
);
