import type { FrameLocator, Locator } from "@playwright/test";
import { DataTids } from "../../Standard/DataTids.js";
import { WidgetPage, widgetPageFixture } from "./widgetPageFixture.js";

class PlaygroundTwoStepPage {
  public constructor(
    private readonly page: FrameLocator,
    public readonly widgetPage: WidgetPage
  ) {}

  public get accountInput(): Locator {
    return this.page.getByTestId(DataTids.InputAccount);
  }

  public get messageInput(): Locator {
    return this.page.getByTestId(DataTids.InputMessage);
  }

  public get moduleToggle(): Locator {
    return this.page.getByTestId(DataTids.ToggleModule);
  }

  public get renderToggle(): Locator {
    return this.page.getByTestId(DataTids.ToggleRender);
  }

  public get authorizeLink(): Locator {
    return this.page.getByTestId(DataTids.LinkAuthorize);
  }
}

type PlaygroundTwoStepPageFixture = {
  readonly playgroundTwoStepPage: PlaygroundTwoStepPage;
};

export const playgroundTwoStepPageFixture = widgetPageFixture.extend<PlaygroundTwoStepPageFixture>({
  playgroundTwoStepPage: ({ storybookIframe, widgetPage }, use) =>
    use(new PlaygroundTwoStepPage(storybookIframe, widgetPage)),
});
