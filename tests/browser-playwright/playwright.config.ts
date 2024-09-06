import { defineConfig } from "@playwright/test";
import { createLocalConfig } from "./playwright.config.common.js";

export default defineConfig({
    ...createLocalConfig(true),

    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: false,
    /* Retry on CI only */
    retries: 0,
    maxFailures: 2,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [["list"]],
});
