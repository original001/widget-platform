import { expect, test } from "@playwright/test";
import type { StoryIndex } from "@storybook/types";
import { baseURL } from "./constants.js";

const response = await fetch(`${baseURL}/index.json`);
const stories = (await response.json()) as StoryIndex;

for (const name in stories.entries) {
  test(name, async ({ page }) => {
    await page.goto(`?path=/story/${name}`);
    await page.getByRole("tab", { name: "Interactions" }).click();

    await expect(page.getByLabel("Status of the test run")).toHaveText("Pass", { timeout: 20000 });
  });
}
