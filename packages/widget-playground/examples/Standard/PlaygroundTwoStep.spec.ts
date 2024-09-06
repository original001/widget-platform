import { expect, mergeTests } from "@playwright/test";
import { playgroundTwoStepPageFixture } from "../fixtures/pageObjects/playgroundTwoStepPageFixture.js";
import { storybookUrlFixture } from "../fixtures/storybookUrlFixture.js";

storybookUrlFixture.use({
  storyGroup: "PlaygroundTwoStep",
  storyPath: "render",
});

const test = mergeTests(playgroundTwoStepPageFixture);

test("Load extern account", async ({ playgroundTwoStepPage }) => {
  await expect(playgroundTwoStepPage.accountInput).toHaveValue("developer");
});

test("Display widget", async ({ playgroundTwoStepPage }) => {
  const testAccount = "random account";
  const testMessage = "some message";
  await playgroundTwoStepPage.accountInput.fill(testAccount);
  await playgroundTwoStepPage.moduleToggle.click();
  await playgroundTwoStepPage.messageInput.fill(testMessage);
  await playgroundTwoStepPage.renderToggle.click();

  const widget = playgroundTwoStepPage.widgetPage.container;
  await expect(widget).toContainText(testAccount, { timeout: 10000 });
  await expect(widget).toContainText(testMessage);
});

test("Cache module", async ({ playgroundTwoStepPage }) => {
  const testMessage = "original message";
  await playgroundTwoStepPage.moduleToggle.click();
  await playgroundTwoStepPage.messageInput.fill(testMessage);
  await playgroundTwoStepPage.renderToggle.click();

  const widget = playgroundTwoStepPage.widgetPage.container;
  await expect(widget).toContainText(testMessage, { timeout: 10000 });

  const newTestMessage = "changed message";
  await playgroundTwoStepPage.messageInput.fill(newTestMessage);
  await expect(widget).toContainText(newTestMessage, { timeout: 10000 });
  await expect(widget).toContainText("Incarnation: 2");
});

test("Save data to local storage", async ({ page, playgroundTwoStepPage }) => {
  const testMessage = "original message";
  await playgroundTwoStepPage.moduleToggle.click();
  await playgroundTwoStepPage.messageInput.fill(testMessage);

  await page.reload();

  await expect(playgroundTwoStepPage.messageInput).toHaveValue(testMessage);
  await expect(playgroundTwoStepPage.moduleToggle).toBeChecked();
  await expect(playgroundTwoStepPage.renderToggle).not.toBeChecked();
});
