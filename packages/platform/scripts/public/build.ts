import { build } from "../build.js";
import { readCwdData } from "./private/readCwdData.js";

const { artifactsDirectory, appUserPaths, config } = await readCwdData();

await build(artifactsDirectory, appUserPaths, config);
