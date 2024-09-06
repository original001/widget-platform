import { test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const getInputLocator = (page: Page, inputName: string): Locator => page.locator(`textarea[name=${inputName}]`);

class StorybookControlsPage {
  public constructor(private readonly page: Page) {}

  public get account(): Locator {
    return getInputLocator(this.page, "account");
  }

  public get children(): Locator {
    return getInputLocator(this.page, "children");
  }
}

type StorybookControlsPageFixture = {
  readonly storybookControlsPage: StorybookControlsPage;
};

export const storybookControlsPageFixture = test.extend<StorybookControlsPageFixture>({
  storybookControlsPage: ({ page }, use) => use(new StorybookControlsPage(page)),
});
