import { preview } from "../preview.js";
import { pressEnterToExit } from "./private/pressEnterToExit.js";
import { readCwdData } from "./private/readCwdData.js";

const { artifactsDirectory, appUserPaths, config } = await readCwdData();

const { address, dispose } = await preview(artifactsDirectory, appUserPaths, config);
console.log(`Preview server started at ${address}`);

await pressEnterToExit();
await dispose();
