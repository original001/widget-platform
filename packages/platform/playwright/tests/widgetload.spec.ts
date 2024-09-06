import { expect } from "@playwright/test";
import { messageFoTest } from "../../runtime/tests/widget/renderReact/messageFoTest.js";
import { devServerFixture, previewServerFixture } from "../fixtures/serve.js";

devServerFixture("render react in dev", async ({ page, serve }) => {
  const { address } = await serve();

  await page.goto(address);

  await expect(page.getByText(messageFoTest)).toBeVisible();
});

previewServerFixture("render react in preview", async ({ page, serve }) => {
  const { address } = await serve();

  await page.goto(address);

  await expect(page.getByText(messageFoTest)).toBeVisible();
});
