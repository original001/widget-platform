import { createPlaywrightConfig, defaultPlaygroundUrl } from "./playwright.common.js";

export default createPlaywrightConfig("platform-scripts-watch", "npm run watch", defaultPlaygroundUrl);
