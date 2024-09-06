import { expect } from "@playwright/test";
import { ModeType } from "../../exports/index.js";
import { openWidgetFixture } from "../fixtures/openWidgetFixture.js";

openWidgetFixture("Pass import deps", async ({ page, openWidget }) => {
  await openWidget(ModeType.PassImportDeps);

  await expect(page.getByText("FROM-PLAYGROUND-HOT")).toBeVisible();
});
