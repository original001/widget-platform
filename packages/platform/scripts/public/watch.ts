import { watch } from "../watch.js";
import { pressEnterToExit } from "./private/pressEnterToExit.js";
import { readCwdData } from "./private/readCwdData.js";

const { artifactsDirectory, appUserPaths, config } = await readCwdData();

const { address, dispose } = await watch(artifactsDirectory, appUserPaths, config);
console.log(`Watch server started at ${address}`);

await pressEnterToExit();
await dispose();
