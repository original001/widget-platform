import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

import child = require("child_process");

const artifactsFolder = resolve(fileURLToPath(import.meta.url), "../../../.artifacts");
if (!existsSync(artifactsFolder)) {
  mkdirSync(artifactsFolder);
}

child.execSync(`npm pack --pack-destination ${artifactsFolder}`);
