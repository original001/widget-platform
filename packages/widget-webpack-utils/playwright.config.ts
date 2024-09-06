import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";
import { baseURL } from "./constants.js";

const projectName = "widget-webpack-utils";
const artifactsPath = "../../.artifacts/" + projectName + "-playwright";

export default defineConfig({
  testDir: "./",
  outputDir: resolve(artifactsPath, "test-results"),
  preserveOutput: "failures-only",
  fullyParallel: true,
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    testIdAttribute: "data-tid",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: true,
  /* Retry on CI only */
  retries: 1,
  workers: 3,
  maxFailures: 10,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["html", { outputFolder: resolve(artifactsPath, "html"), open: "never" }],
    ["junit", { outputFile: resolve("../../", `junit.${projectName}.xml`) }],
  ],
});
