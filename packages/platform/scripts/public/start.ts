import { start } from "../start.js";
import { pressEnterToExit } from "./private/pressEnterToExit.js";
import { readCwdData } from "./private/readCwdData.js";

const { artifactsDirectory, appUserPaths, config } = await readCwdData();

const { playground, dispose } = await start(artifactsDirectory, appUserPaths, config);
playground.printUrls();

await pressEnterToExit();
await dispose();
