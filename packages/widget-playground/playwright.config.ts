import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";

const projectName = "widget-playground";
const artifactsPath = "../../.artifacts/" + projectName + "-playwright";
const baseURL = "https://localhost:6006";

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
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    testIdAttribute: "data-tid",
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
  webServer: {
    command: "npm run storybook-preview",
    url: baseURL,
    reuseExistingServer: true,
    ignoreHTTPSErrors: true,
  },

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
