import { devices } from "@playwright/test";
import type { PlaywrightTestConfig } from "@playwright/test";
import { resolve } from "path";
import { baseURL } from "./constants.js";

export const projectName = "e2e";
export const artifactsPath = "../../.artifacts/" + projectName + "-playwright";

export function createLocalConfig(reuseExistingServer: boolean): PlaywrightTestConfig {
  return {
    testDir: "./tests",
    outputDir: resolve(artifactsPath, "test-results"),
    preserveOutput: "failures-only",
    fullyParallel: true,
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
      baseURL,

      /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
      trace: "on-first-retry",
      screenshot: "only-on-failure",
      video: "on-first-retry",
    },

    projects: [
      {
        name: "chromium",
        use: { ...devices["Desktop Chrome"] },
      },
      {
        name: "firefox",
        use: { ...devices["Desktop Firefox"] },
      },
      {
        name: "webkit",
        use: { ...devices["Desktop Safari"] },
      },
    ],

    webServer: {
      command: "npm run start",
      url: baseURL,
      reuseExistingServer,
    },
  };
}
