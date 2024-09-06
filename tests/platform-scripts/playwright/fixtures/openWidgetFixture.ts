import { test } from "@playwright/test";
import { ModeType, SingleModeType } from "platform-scripts-npm-loader";

type OpenWidgetFixture = {
  openWidget: (mode: ModeType | SingleModeType) => Promise<void>;
};

export const openWidgetFixture = test.extend<OpenWidgetFixture>({
  openWidget: ({ page }, use) =>
    use(async (mode) => {
      await page.goto(""); // это оно откроет урл относительно baseURL-а из конфига. если написать сюда /, то сломается кейс, где файлы "деплоятся" не в корень
      await page.getByTestId(mode).click();
    }),
});
