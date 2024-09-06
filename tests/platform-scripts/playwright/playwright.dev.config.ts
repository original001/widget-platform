import { createPlaywrightConfig, defaultPlaygroundUrl } from "./playwright.common.js";

export default createPlaywrightConfig("platform-scripts-dev", "npm run start", defaultPlaygroundUrl);
