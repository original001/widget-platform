import type { FrameLocator, Locator } from "@playwright/test";
import { DataTids } from "../../Minimal/DataTids.js";
import { storybookIframeFixture } from "../storybookIframeFixture.js";

export class WidgetPage {
  public constructor(private readonly page: FrameLocator) {}

  public get container(): Locator {
    return this.page.getByTestId(DataTids.WidgetContainer);
  }
}

type WidgetPageFixture = {
  readonly widgetPage: WidgetPage;
};

export const widgetPageFixture = storybookIframeFixture.extend<WidgetPageFixture>({
  widgetPage: ({ storybookIframe }, use) => use(new WidgetPage(storybookIframe)),
});
