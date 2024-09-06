import { expect, test } from "@playwright/test";
import { ExternalsType } from "../server/src/playground/ExternalsType.js";
import { ExternalsTypeSelectRadio } from "../server/src/playground/ExternalsTypesComponent.js";
import { LoaderComponent, WidgetImportInput } from "../server/src/playground/LoaderComponent.js";
import {
  WidgetModuleGetButton,
  WidgetModuleListComponent,
} from "../server/src/playground/WidgetModuleListComponent.js";
import { WidgetRenderController } from "../server/src/playground/WidgetRenderController.js";
import { createReactSelector, createReactSelectorWithFilter } from "./react.js";

Object.values(ExternalsType).forEach((externalsType) => {
  test(`${externalsType}-render-message`, async ({ page }) => {
    await page.goto("/");

    const loader = page.locator(createReactSelector(LoaderComponent));
    await loader
      .locator(createReactSelectorWithFilter(ExternalsTypeSelectRadio, "externalsType", externalsType))
      .check();
    const expectedValue = "hi, michael";
    await loader.locator(createReactSelector(WidgetImportInput)).fill(expectedValue);

    await loader
      .locator(createReactSelectorWithFilter(WidgetModuleListComponent, "externalsType", externalsType))
      .locator(createReactSelector(WidgetModuleGetButton))
      .click();

    const widgetRenderResult = loader.locator(
      createReactSelectorWithFilter(WidgetRenderController, "message", expectedValue)
    );

    await expect(widgetRenderResult.getByText(expectedValue)).toBeVisible();
  });
});
