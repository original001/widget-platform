import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";

const projectName = "widget-framework";
const artifactsPath = "../../.artifacts/" + projectName + "-playwright";

const ignoreSslErrors = {
  contextOptions: {
    ignoreHTTPSErrors: true,
  },
};

export default defineConfig({
  testDir: "./",
  outputDir: resolve(artifactsPath, "test-results"),
  preserveOutput: "failures-only",
  fullyParallel: true,
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...ignoreSslErrors,
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        ...ignoreSslErrors,
      },
    },
  ],
  retries: 1,
  workers: 2,
  maxFailures: 5,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["html", { outputFolder: resolve(artifactsPath, "html"), open: "never" }],
    ["junit", { outputFile: resolve("../../", `junit.${projectName}.xml`) }],
  ],
});
