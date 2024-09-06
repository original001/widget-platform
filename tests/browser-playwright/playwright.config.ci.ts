import { defineConfig } from "@playwright/test";
import { resolve } from "path";
import { artifactsPath, createLocalConfig, projectName } from "./playwright.config.common.js";

export default defineConfig({
  ...createLocalConfig(false),

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: true,
  /* Retry on CI only */
  retries: 1,
  workers: 2,
  maxFailures: 10,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["html", { outputFolder: resolve(artifactsPath, "html"), open: "never" }],
    ["junit", { outputFile: resolve("../../", `junit.${projectName}.xml`) }],
  ],
});
