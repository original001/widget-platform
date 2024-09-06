import { defineConfig, devices } from "@playwright/test";
import { resolve } from "path";
import { baseURL } from "./constants.js";

const projectName = "widget-consumer-react-utils";
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
    ...devices["Desktop Chrome"],
  },

  webServer: {
    command: "npm run storybook-preview",
    url: baseURL,
    reuseExistingServer: true,
  },

  retries: 1,
  workers: 3,
  maxFailures: 5,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["list"],
    ["html", { outputFolder: resolve(artifactsPath, "html"), open: "never" }],
    ["junit", { outputFile: resolve("../../", `junit.${projectName}.xml`) }],
  ],
});
