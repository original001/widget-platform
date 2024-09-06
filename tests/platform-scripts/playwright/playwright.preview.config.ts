import { createPlaywrightConfig, defaultPlaygroundUrl } from "./playwright.common.js";

export default createPlaywrightConfig("platform-scripts-preview", "npm run preview", defaultPlaygroundUrl);
