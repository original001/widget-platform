import { expect } from "@playwright/test";
import { SingleModeType } from "../../exports/index.js";
import { imageDataTestId } from "../../widget/assets/imageDataTestId.js";
import { openWidgetFixture } from "../fixtures/openWidgetFixture.js";

const cases = [
  SingleModeType.LoadImportedAssets,
  SingleModeType.LoadImportMetaUrlAssets,
  SingleModeType.LoadStyleAssets,
];

for (const mode of cases) {
  openWidgetFixture(`static images - ${mode}`, async ({ page, context, openWidget }) => {
    const non200: unknown[] = [];

    await context.route(/\.png(\?|$)/, async (route) => {
      const response = await route.fetch();
      if (response.status() !== 200)
        non200.push({
          code: response.status(),
          url: response.url(),
        });
      await route.fulfill({ response });
    });

    await openWidget(mode);
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId(imageDataTestId)).toHaveScreenshot();
    expect(non200).toHaveLength(0);
  });
}
