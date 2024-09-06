import { devices } from "@playwright/test";
import { resolve } from "path";
import type { PlaywrightTestConfig } from "playwright/types/test";
import { playgroundPort } from "../.platform/playgroundPort.js";

export const defaultPlaygroundUrl = `https://localhost:${playgroundPort}/`;

export function createPlaywrightConfig(projectName: string, command: string, baseURL: string): PlaywrightTestConfig {
  const artifactsPath = "../../.artifacts/" + projectName + "-playwright";

  return {
    testDir: "./",
    outputDir: resolve(artifactsPath, "test-results"),
    preserveOutput: "failures-only",
    fullyParallel: true,
    snapshotPathTemplate: "{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}",
    use: {
      baseURL,
      trace: "on-first-retry",
      screenshot: "only-on-failure",
      video: "on-first-retry",
      ...devices["Desktop Chrome"],
      contextOptions: {
        ignoreHTTPSErrors: true,
      },
    },
    projects: [
      {
        name: projectName,
      },
    ],
    webServer: {
      command,
      url: baseURL,
      reuseExistingServer: false,
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
  };
}
