import { createPlaywrightConfig } from "./playwright.common.js";

export default createPlaywrightConfig(
  "platform-scripts-serve",
  "npm run serve",
  "http://localhost:6006/.artifacts/playground/index.cloud.html"
);
