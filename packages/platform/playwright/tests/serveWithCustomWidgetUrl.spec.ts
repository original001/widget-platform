import { expect } from "@playwright/test";
import {
  pathToServePlayground,
  pathToServeWidget,
} from "../../runtime/tests/playground/withCustomEnvAndWidgetUrl/environmentConfigs.js";
import { messageFoTest } from "../../runtime/tests/widget/renderReact/messageFoTest.js";
import { sirvBuiltFixture } from "../fixtures/serve.js";

sirvBuiltFixture("render react in served index.env.html", async ({ page, serve, testsDirectory }) => {
  const indexServedEnvHtml = "index.served-env.html";
  const { address } = await serve(
    {
      playgroundPath: pathToServePlayground,
      widgetPath: pathToServeWidget,
    },
    {
      paths: (p) => ({
        ...p,
        appVitePaths: {
          ...p.appVitePaths,
          appPlaygroundDirectory: [...testsDirectory, "playground", "withCustomEnvAndWidgetUrl"],
        },
      }),
      config: (c) => ({
        ...c,
        playgroundConfig: {
          ...c.playgroundConfig,
          htmlConfigs: { [indexServedEnvHtml]: "getServedEnvConfig" },
        },
      }),
    }
  );

  await page.goto(new URL(indexServedEnvHtml, new URL(pathToServePlayground, address)).href);

  await expect(page.getByText(messageFoTest)).toBeVisible();
});
