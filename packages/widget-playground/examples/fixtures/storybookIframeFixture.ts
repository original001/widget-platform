import { type FrameLocator, test } from "@playwright/test";

type StorybookIframeFixture = {
  readonly storybookIframe: FrameLocator;
};

export const storybookIframeFixture = test.extend<StorybookIframeFixture>({
  storybookIframe: ({ page }, use) => use(page.frameLocator('iframe[title="storybook-preview-iframe"]')),
});
