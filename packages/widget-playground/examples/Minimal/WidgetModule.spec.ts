import { expect, mergeTests } from "@playwright/test";
import { storybookControlsPageFixture } from "../fixtures/pageObjects/storybookControlsPageFixture.js";
import { widgetPageFixture } from "../fixtures/pageObjects/widgetPageFixture.js";
import { storybookUrlFixture } from "../fixtures/storybookUrlFixture.js";

const baseTest = mergeTests(storybookUrlFixture, storybookControlsPageFixture);
baseTest.use({
  storyGroup: "WidgetModule",
  storyPath: "render",
});

baseTest("Load extern account", async ({ storybookControlsPage }) => {
  await expect(storybookControlsPage.account).toHaveValue("developer");
});

const test = mergeTests(baseTest, widgetPageFixture);

test("Display widget", async ({ widgetPage, storybookControlsPage }) => {
  const testAccount = "random account";
  await storybookControlsPage.account.fill(testAccount);
  const testMessage = "some message";
  await storybookControlsPage.children.fill(testMessage);

  await expect(widgetPage.container).toContainText(testAccount, { timeout: 10000 });
  await expect(widgetPage.container).toContainText(testMessage);
});

test("Cache module", async ({ widgetPage, storybookControlsPage }) => {
  const testMessage = "original message";
  await storybookControlsPage.children.fill(testMessage);

  await expect(widgetPage.container).toContainText(testMessage, { timeout: 10000 });

  const newTestMessage = "changed message";
  await storybookControlsPage.children.fill(newTestMessage);
  await expect(widgetPage.container).toContainText(newTestMessage, { timeout: 10000 });
  await expect(widgetPage.container).toContainText("Incarnation: 2");
});
